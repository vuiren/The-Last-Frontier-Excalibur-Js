import { Engine, Scene, vec, PointerEvent, PointerButton } from "excalibur";
import { Spawner } from "./spawner";
import { GroupsManager } from "./groupsManager";
import { Group } from "./group";
import { BackGroundYLevel, Faction, FrontGroundYLevel, Lane } from "./constants";
import { UnitsManager } from "./unitsManager";
import { ICombatant, IGroupable } from "./combatant";
import { BuildingsManager } from "./buildingsManager";
import { PlayerUnit } from "./units/playerUnit";
import { Bridge } from "./buildings/bridge";
import { drawDottedLine } from "./drawDottedLine";
import { BarricadeScraps } from "./buildings/barricadeScraps";
import { ChangeLaneButton } from "./ingameButtons/changeLaneButton";

export class MyLevel extends Scene {
    allGroupables: IGroupable[] = [];
    allCombatants: ICombatant[] = [];
    allSpawners: Spawner[] = [];

    unitsManager: UnitsManager;
    buildingsManager: BuildingsManager;
    groupsManager: GroupsManager = new GroupsManager();
    selectedUnit: ICombatant | null = null;
    playerGroup: Group | null = null;
    private dashOffset = 0;
    private dashLen = 6;
    private gapLen = 4;

    constructor() {
        super();
        this.unitsManager = new UnitsManager(this.allCombatants, this.allGroupables, this.groupsManager);
        this.buildingsManager = new BuildingsManager(this.allCombatants);
    }

    override onInitialize(engine: Engine): void {

        this.unitsManager.spawnPlayerUnit(this, vec(200, FrontGroundYLevel), "playerSoldier", Lane.Front, this.unitSelection, this.unitRightClick)
        this.unitsManager.spawnPlayerUnit(this, vec(250, FrontGroundYLevel), "playerSoldier", Lane.Front, this.unitSelection, this.unitRightClick)
        this.unitsManager.spawnPlayerUnit(this, vec(150, FrontGroundYLevel), "playerSoldier", Lane.Front, this.unitSelection, this.unitRightClick)
        this.unitsManager.spawnPlayerUnit(this, vec(100, FrontGroundYLevel), "playerSoldier", Lane.Front, this.unitSelection, this.unitRightClick)
        this.unitsManager.spawnPlayerUnit(this, vec(300, FrontGroundYLevel), "playerSoldier", Lane.Back, this.unitSelection, this.unitRightClick)

        this.unitsManager.spawnEnemyUnit(this, vec(600, FrontGroundYLevel), "enemyZombie", Lane.Front)
        this.unitsManager.spawnEnemyUnit(this, vec(650, FrontGroundYLevel), "enemyZombie", Lane.Front)
        this.unitsManager.spawnEnemyUnit(this, vec(700, FrontGroundYLevel), "enemyZombie", Lane.Front)
        this.unitsManager.spawnEnemyUnit(this, vec(650, FrontGroundYLevel), "enemyZombie", Lane.Back)

        this.buildingsManager.spawnPlayerBase(this, vec(100, FrontGroundYLevel), Faction.Player, Lane.Front)
        this.buildingsManager.spawnBarricade(this, vec(200, FrontGroundYLevel), Faction.Player, Lane.Front)

        this.buildingsManager.spawnPlayerBase(this, vec(100, FrontGroundYLevel), Faction.Player, Lane.Back)

        const bridge = new Bridge(vec(300, 420))
        this.add(bridge);

        const changeLaneButtonFront = new ChangeLaneButton(vec(300, FrontGroundYLevel - 50), this.allCombatants, Lane.Front);
        const changeLaneButtonBack = new ChangeLaneButton(vec(300, BackGroundYLevel + 50), this.allCombatants, Lane.Back);
        this.add(changeLaneButtonFront);
        this.add(changeLaneButtonBack);

        const barricadeScraps = new BarricadeScraps(vec(-100, FrontGroundYLevel), this.allGroupables, this.buildingsManager, Lane.Front);
        this.add(barricadeScraps);

        engine.input.pointers.primary.on('down', e => this.onMouseDown(e))
    }

    override onPreUpdate(engine: Engine, elapsed: number): void {
        const collisionsManager = this.unitsManager.collisionManager;
        collisionsManager.checkCollisions();
        const processedUnits: Set<ICombatant> = new Set();

        collisionsManager.collidingUnits.forEach((collidingWith, unit) => {
            if (collidingWith.length === 0) return;
            if (processedUnits.has(unit)) return;

            collidingWith.forEach(other => {
                // Both are group leaders — merge
                if (unit.groupRef !== null && other.groupRef !== null) {
                    collisionsManager.mergeGroups(unit.groupRef, other.groupRef, this.groupsManager);
                    return;
                }

                if (processedUnits.has(other)) return;
                processedUnits.add(other);

                const group = unit.groupRef ?? this.groupsManager.createGroup(unit);
                this.groupsManager.addToGroup(other, group);
                console.log(`${other.id} added to group ${group}`);
            });

            console.log(`${unit.id} colliding with ${collidingWith.map(u => u.id).join(', ')}`);
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

    onMouseDown(e: PointerEvent) {
        if (e.button === PointerButton.Right) {
            const selected = this.allCombatants.filter(x => x.faction === Faction.Player && x instanceof PlayerUnit && x.isSelected)
            selected.forEach(x => {
                x.changeLane()
            })
        }
    }

    unitSelection(unit: ICombatant) {
        if (!(unit instanceof PlayerUnit)) return
        unit.isSelected = !unit.isSelected;
        if (unit.isSelected) {
            unit.select();
        } else {
            unit.deselect()
        }
    }

    unitRightClick(unit: ICombatant) {
        unit.changeLane()
    }
}