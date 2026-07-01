import { Engine, Scene, vec } from "excalibur";
import { GroupsManager } from "./groupsManager";
import { Group } from "./group";
import { BackGroundYLevel, Faction, FrontGroundYLevel, Lane } from "./constants";
import { UnitsManager } from "./unitsManager";
import { ICombatant, IGroupable } from "./combatant";
import { BuildingsManager } from "./buildingsManager";
import { Bridge } from "./buildings/bridge";
import { drawDottedLine } from "./drawDottedLine";
import { BarricadeScraps } from "./buildings/barricadeScraps";
import { ChangeLaneButton } from "./ingameButtons/changeLaneButton";
import { spawnCaptureZone, spawnInfectedFarmHouse } from "./spawnFunctions";

export class MyLevel extends Scene {
    allGroupables: IGroupable[] = [];
    allCombatants: ICombatant[] = [];

    unitsManager: UnitsManager;
    buildingsManager: BuildingsManager;
    groupsManager: GroupsManager = new GroupsManager();
    selectedUnit: ICombatant | null = null;
    playerGroup: Group | null = null;
    private dashOffset = 0;
    private dashLen = 6;
    private gapLen = 4;

    private movingCameraRight = false;
    private movingCameraLeft = false;

    constructor() {
        super();
        this.unitsManager = new UnitsManager(this.allCombatants, this.allGroupables, this.groupsManager);
        this.buildingsManager = new BuildingsManager(this.allCombatants);
    }

    override onInitialize(engine: Engine): void {
        const btn = document.getElementById('move-camera-right')!;
        btn.addEventListener('pointerenter', () => { this.movingCameraRight = true; });
        btn.addEventListener('pointerleave', () => { this.movingCameraRight = false; });

        const btnLeft = document.getElementById('move-camera-left')!;
        btnLeft.addEventListener('pointerenter', () => { this.movingCameraLeft = true; });
        btnLeft.addEventListener('pointerleave', () => { this.movingCameraLeft = false; });

        this.unitsManager.spawnPlayerUnit(this, 200, "playerSoldier", Lane.Front)
        this.unitsManager.spawnPlayerUnit(this, 250, "playerSoldier", Lane.Front)
        this.unitsManager.spawnPlayerUnit(this, 150, "playerSoldier", Lane.Front)
        this.unitsManager.spawnPlayerUnit(this, 100, "playerSoldier", Lane.Front)
        this.unitsManager.spawnPlayerUnit(this, 300, "playerSoldier", Lane.Back)

        this.unitsManager.spawnEnemyUnit(this, 600, "enemyZombie", Lane.Front)
        this.unitsManager.spawnEnemyUnit(this, 650, "enemyZombie", Lane.Front)
        this.unitsManager.spawnEnemyUnit(this, 700, "enemyZombie", Lane.Front)
        this.unitsManager.spawnEnemyUnit(this, 650, "enemyZombie", Lane.Back)

        this.buildingsManager.spawnPlayerBase(this, 100, Faction.Player, Lane.Front)
        this.buildingsManager.spawnBarricade(this, 200, Faction.Player, Lane.Front)
        this.buildingsManager.spawnPlayerBase(this, 100, Faction.Player, Lane.Back)


        spawnInfectedFarmHouse(this, 650, Faction.Enemy, 100, Lane.Front, this.unitsManager, this.allGroupables)
        spawnInfectedFarmHouse(this, 650, Faction.Enemy, 100, Lane.Back, this.unitsManager, this.allGroupables)

        spawnCaptureZone(this, vec(330, FrontGroundYLevel), this.allGroupables, Lane.Front)

        const bridge = new Bridge(vec(300, 420))
        this.add(bridge);

        const changeLaneButtonFront = new ChangeLaneButton(vec(300, FrontGroundYLevel - 50), this.allGroupables, Lane.Front);
        const changeLaneButtonBack = new ChangeLaneButton(vec(300, BackGroundYLevel + 50), this.allGroupables, Lane.Back);
        this.add(changeLaneButtonFront);
        this.add(changeLaneButtonBack);

        const barricadeScraps = new BarricadeScraps(vec(-100, FrontGroundYLevel), this.allGroupables, this.buildingsManager, Lane.Front);
        this.add(barricadeScraps);
    }

    override onPreUpdate(engine: Engine, elapsed: number): void {

        if (this.movingCameraRight) {
            const speed = 0.3;
            engine.currentScene.camera.pos.x += speed * elapsed;
        }

        if (this.movingCameraLeft) {
            const speed = 0.3;
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

    onPostUpdate(engine: ex.Engine, delta: number) {
        this.dashOffset = (this.dashOffset + delta * 0.04) % (this.dashLen + this.gapLen);
    }

    onPreDraw(ctx: ex.ExcaliburGraphicsContext) {
        for (const group of this.groupsManager.groups) {
            for (let i = 0; i < group.members.length - 1; i++) {
                const fromScreen = this.engine.worldToScreenCoordinates(group.members[i].globalPos);
                const toScreen = this.engine.worldToScreenCoordinates(group.members[i + 1].globalPos);

                drawDottedLine(ctx, this.dashOffset, fromScreen, toScreen, undefined, this.dashLen, this.gapLen);
            }
        }
    }
}