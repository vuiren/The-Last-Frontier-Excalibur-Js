import { Color, Engine, ExcaliburGraphicsContext, Scene, Timer, vec } from "excalibur";
import { GroupsManager } from "./groupsManager";
import { UnitsManager } from "./unitsManager";
import { ICombatant, IGroupable } from "./combatant";
import { drawDottedLine } from "./drawDottedLine";
import { importLdtkLevel } from "./ldtkImporter";
import { BuildManager, BuildSpawns } from "./buildManager";
import { EntitySpawner } from "./entitySpawner";
import { Building } from "./buildings/building";

export class MyLevel extends Scene {
    private readonly allGroupables: IGroupable[] = [];
    private readonly allCombatants: ICombatant[] = [];
    private readonly allBuildings: Building[] = [];
    private readonly unitsManager: UnitsManager;
    private readonly groupsManager: GroupsManager = new GroupsManager();
    private readonly entitySpawner: EntitySpawner;

    private buildManager!: BuildManager;

    private dashOffset = 0;
    private dashLen = 6;
    private gapLen = 4;

    private movingCameraRight = false;
    private movingCameraLeft = false;

    constructor() {
        super();
        this.unitsManager = new UnitsManager(this.allCombatants, this.allGroupables, this.groupsManager);
        this.entitySpawner = new EntitySpawner(this, this.unitsManager, this.groupsManager, this.allGroupables, this.allCombatants, this.allBuildings);
    }

    override onInitialize(engine: Engine): void {
        this.backgroundColor = Color.fromHex("1F4073");
        this.buildManager = new BuildManager(this.engine, this.entitySpawner, this.allBuildings);

        this.camera.zoom = 2
        this.camera.pos = vec(400, 125);

        const btnRight = document.getElementById('move-camera-right')!;
        btnRight.addEventListener('pointerenter', () => { this.movingCameraRight = true; });
        btnRight.addEventListener('pointerleave', () => { this.movingCameraRight = false; });

        const btnLeft = document.getElementById('move-camera-left')!;
        btnLeft.addEventListener('pointerenter', () => { this.movingCameraLeft = true; });
        btnLeft.addEventListener('pointerleave', () => { this.movingCameraLeft = false; });

        const btnCancel = document.getElementById('cancel-building') as HTMLButtonElement;
        btnCancel.addEventListener('click', () => {
            if (btnCancel.disabled) return;
            this.buildManager.stopPlacingBuilding();
            btnCancel.disabled = true
        });

        const zoomInButton = document.getElementById('zoom-in') as HTMLButtonElement
        zoomInButton.addEventListener('click', () => {
            this.camera.zoom = 3
            this.camera.pos = vec(this.camera.pos.x, 175)
        })

        const zoomOutButton = document.getElementById('zoom-out') as HTMLButtonElement
        zoomOutButton.addEventListener('click', () => {
            this.camera.zoom = 2
            this.camera.pos = vec(this.camera.pos.x, 125)
        })

        const COOLDOWN_MS = 3000;
        this.setupBuildButton('place-barricade', 'barricadeSpawn', COOLDOWN_MS);
        this.setupBuildButton('place-farm', 'farmSpawn', COOLDOWN_MS);

        importLdtkLevel(this, {
            entitySpawner: this.entitySpawner,
        });

        (window as any).debug = {
            scene: this,
            units: this.unitsManager,
            groups: this.groupsManager,
            buildings: this.allBuildings,
            combatants: this.allCombatants,
        };
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
            const screenPositions = group.members.map(m =>
                this.engine.worldToScreenCoordinates(m.globalPos)
            );
            for (let i = 0; i < screenPositions.length - 1; i++) {
                drawDottedLine(ctx, this.dashOffset, screenPositions[i], screenPositions[i + 1], undefined, this.dashLen, this.gapLen);
            }
        }
    }

    private setupBuildButton(elementId: string, buildType: BuildSpawns, cooldownMs: number) {
        const button = document.getElementById(elementId) as HTMLButtonElement;
        const cancelButton = document.getElementById("cancel-building") as HTMLButtonElement;

        const cooldownTimer = new Timer({
            repeats: false,
            interval: cooldownMs,
            onComplete: () => {
                button.classList.remove('cooldown');
                button.disabled = false;
                this.buildManager.onCooldown = false;
            }
        });
        this.engine.add(cooldownTimer);

        button.addEventListener('click', () => {
            if (button.disabled) return;

            if (this.buildManager.isPlacingBuilding && this.buildManager.buildType === buildType) {
                cancelButton.disabled = true
                this.buildManager.stopPlacingBuilding();

            } else {
                cancelButton.disabled = false
                this.buildManager.onCooldown = false;
                this.buildManager.setBuildingType(buildType);
                this.buildManager.startPlacingBuilding();
            }
        });

        this.buildManager.events.on(buildType, () => {
            button.style.setProperty('--cooldown', `${cooldownMs}ms`);
            button.classList.add('cooldown');
            button.disabled = true;
            this.buildManager.onCooldown = true;
            cooldownTimer.reset();
            cooldownTimer.start();
        });
    }
}

