import { Engine, ExcaliburGraphicsContext, Scene, Timer, Vector } from "excalibur";
import { GroupsManager } from "./groupsManager";
import { Group } from "./group";
import { UnitsManager } from "./unitsManager";
import { ICombatant, IGroupable } from "./combatant";
import { BuildingsManager } from "./buildingsManager";
import { drawDottedLine } from "./drawDottedLine";
import { importLdtkLevel } from "./ldtkImporter";
import { BuildManager } from "./buildManager";
import { EntitySpawner } from "./entitySpawner";

export class MyLevel extends Scene {
    allGroupables: IGroupable[] = [];
    allCombatants: ICombatant[] = [];

    unitsManager: UnitsManager;
    buildingsManager: BuildingsManager;
    buildManager!: BuildManager;
    groupsManager: GroupsManager = new GroupsManager();
    selectedUnit: ICombatant | null = null;
    playerGroup: Group | null = null;
    entitySpawner: EntitySpawner;
    private dashOffset = 0;
    private dashLen = 6;
    private gapLen = 4;

    private movingCameraRight = false;
    private movingCameraLeft = false;

    constructor() {
        super();
        this.unitsManager = new UnitsManager(this.allCombatants, this.allGroupables, this.groupsManager);
        this.buildingsManager = new BuildingsManager(this.allCombatants);
        this.entitySpawner = new EntitySpawner(this, this.unitsManager, this.allGroupables, this.allCombatants, this.buildingsManager);
    }

    override onInitialize(engine: Engine): void {
        this.buildManager = new BuildManager(this.engine, this.entitySpawner);
        this.camera.zoom = 3
        this.camera.pos = engine.screen.center.add(new Vector(0, 60));

        const btnRight = document.getElementById('move-camera-right')!;
        btnRight.addEventListener('pointerenter', () => { this.movingCameraRight = true; });
        btnRight.addEventListener('pointerleave', () => { this.movingCameraRight = false; });

        const btnLeft = document.getElementById('move-camera-left')!;
        btnLeft.addEventListener('pointerenter', () => { this.movingCameraLeft = true; });
        btnLeft.addEventListener('pointerleave', () => { this.movingCameraLeft = false; });

        const buildBarricadeBtn = document.getElementById('place-barricade') as HTMLButtonElement;
        const COOLDOWN_MS = 3000;

        const cooldownTimer = new Timer({
            repeats: false,
            interval: COOLDOWN_MS,
            onComplete: () => {
                buildBarricadeBtn.classList.remove('cooldown');
                buildBarricadeBtn.disabled = false;
            }
        });

        engine.add(cooldownTimer)

        const startCooldown = (button: HTMLButtonElement, duration: number) => {
            button.style.setProperty('--cooldown', `${duration}ms`);
            button.classList.add('cooldown');
            button.disabled = true;

            cooldownTimer.start()
        }

        buildBarricadeBtn.addEventListener('click', () => {
            if (buildBarricadeBtn.classList.contains('cooldown')) return;

            if (this.buildManager.isPlacingBuilding) {
                this.buildManager.stopPlacingBuilding();
            } else {
                this.buildManager.startPlacingBuilding();
            }
        });

        this.buildManager.events.on('barricadeSpawn', () => {
            startCooldown(buildBarricadeBtn, COOLDOWN_MS);
        });

        importLdtkLevel(this, {
            entitySpawner: this.entitySpawner,
        });
        //  spawnCaptureZone(this, vec(330, FrontGroundYLevel), this.allGroupables, Lane.Front)

        //   const changeLaneButtonFront = new ChangeLaneButton(vec(300, FrontGroundYLevel - 50), this.allGroupables, Lane.Front);
        //    const changeLaneButtonBack = new ChangeLaneButton(vec(300, BackGroundYLevel + 50), this.allGroupables, Lane.Back);
        //   this.add(changeLaneButtonFront);
        //   this.add(changeLaneButtonBack);
    }

    override onPreUpdate(engine: Engine, elapsed: number): void {

        if (this.movingCameraRight) {
            const speed = 0.1;
            engine.currentScene.camera.pos.x += speed * elapsed;
        }

        if (this.movingCameraLeft) {
            const speed = 0.1;
            engine.currentScene.camera.pos.x -= speed * elapsed;
        }

        const collisionsManager = this.unitsManager.collisionManager;
        collisionsManager.checkCollisions();

        const processedUnits = new Set<ICombatant>();

        collisionsManager.collidingUnits.forEach((collidingWith, unit) => {
            if (collidingWith.length === 0 || processedUnits.has(unit)) return;

            collidingWith.forEach(other => {
                if (processedUnits.has(other)) return;

                if (unit.groupRef !== null && other.groupRef !== null) {
                    collisionsManager.mergeGroups(unit.groupRef, other.groupRef, this.groupsManager);
                } else {
                    const group = unit.groupRef ?? this.groupsManager.createGroup(unit);
                    this.groupsManager.addToGroup(other, group);
                }

                processedUnits.add(other);
            });

            processedUnits.add(unit);
        });

        this.groupsManager.update();
    }

    onPostUpdate(engine: Engine, delta: number) {
        this.dashOffset = (this.dashOffset + delta * 0.04) % (this.dashLen + this.gapLen);
    }

    onPreDraw(ctx: ExcaliburGraphicsContext) {
        for (const group of this.groupsManager.groups) {
            for (let i = 0; i < group.members.length - 1; i++) {
                const fromScreen = this.engine.worldToScreenCoordinates(group.members[i].globalPos);
                const toScreen = this.engine.worldToScreenCoordinates(group.members[i + 1].globalPos);

                drawDottedLine(ctx, this.dashOffset, fromScreen, toScreen, undefined, this.dashLen, this.gapLen);
            }
        }
    }
}