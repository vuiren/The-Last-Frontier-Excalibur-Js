import { Color, Engine, ExcaliburGraphicsContext, Scene, Timer, vec } from "excalibur";
import { ICombatant } from "./combatant";
import { drawDottedLine } from "../drawDottedLine";
import { importLdtkLevel } from "../ldtkImporter";
import { EntitySpawner } from "./entitySpawner";
import { BuildManager, BuildSpawns } from "./managers/buildManager";
import { GroupsManager } from "./managers/groupsManager";
import { ResourcesManager } from "./managers/resourcesManager";
import { UnitsCollisionManager } from "./managers/unitsCollisionManager";
import { BuildingComponent, CombatantComponent, GroupableComponent } from "./components/components";
import { UnemployedManager } from "./managers/unemployedManager";

export class MyLevel extends Scene {
    private unitsCollisionManager!: UnitsCollisionManager;
    private readonly groupsManager: GroupsManager = new GroupsManager();
    private entitySpawner!: EntitySpawner;
    private readonly resourcesManager: ResourcesManager = new ResourcesManager(5)
    private readonly unemployedManager: UnemployedManager = new UnemployedManager(this)
    private buildManager!: BuildManager;

    private dashOffset = 0;
    private dashLen = 6;
    private gapLen = 4;

    private movingCameraRight = false;
    private movingCameraLeft = false;

    override onInitialize(engine: Engine): void {
        this.entitySpawner = new EntitySpawner(this, this.groupsManager, this.resourcesManager);
        this.unitsCollisionManager = new UnitsCollisionManager(this, this.groupsManager);

        const vacantJobs = this.world.query({
            components: { all: [BuildingComponent, CombatantComponent] },
            tags: { all: ["vacant"] },
        });

        this.backgroundColor = Color.fromHex("1F4073");
        this.buildManager = new BuildManager(this, this.entitySpawner);
        this.camera.zoom = 3
        this.camera.pos = vec(400, 175);

        this.wireUi()

        importLdtkLevel(this, {
            entitySpawner: this.entitySpawner,
        });

        (window as any).debug = {
            scene: this,
            groups: this.groupsManager,
            combatants: this.world.query([CombatantComponent]),
            groupables: this.world.query([GroupableComponent]),
            buildings: this.world.query([BuildingComponent]),
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

        const collisionsManager = this.unitsCollisionManager;
        collisionsManager.checkCollisions();

        const processedUnits = new Set<ICombatant>();

        collisionsManager.collidingUnits.forEach((collidingWith, unit) => {
            if (collidingWith.length === 0 || processedUnits.has(unit)) return;

            collidingWith.forEach(other => {
                if (processedUnits.has(other)) return;

                if (unit.groupRef !== null && other.groupRef !== null) {
                    collisionsManager.mergeGroups(unit.groupRef, other.groupRef);
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

    private wireUi() {
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

        const tacticalMapUi = document.getElementById("tactical-map-ui") as HTMLElement
        tacticalMapUi.hidden = false

        const strategicMapUi = document.getElementById("strategic-map-ui") as HTMLElement
        strategicMapUi.hidden = true

        const zoomInButton = document.getElementById('zoom-in') as HTMLButtonElement
        zoomInButton.addEventListener('click', () => {
            this.camera.zoom = 3
            this.camera.pos = vec(this.camera.pos.x, 175)
        })

        const zoomOutButton = document.getElementById('zoom-out') as HTMLButtonElement
        zoomOutButton.addEventListener('click', () => {
            this.camera.zoom = 2
            this.camera.pos = vec(this.camera.pos.x, 200)
        })

        const COOLDOWN_MS = 500;
        this.setupBuildButton('place-barricade', 'barricadeSpawn', COOLDOWN_MS);
        this.setupBuildButton('place-farm', 'farmSpawn', COOLDOWN_MS);
        this.setupBuildButton('place-builder-outpost', 'builderOutpostSpawn', COOLDOWN_MS);
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

