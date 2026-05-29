import { Engine, Scene, vec, PointerEvent, PointerButton } from "excalibur";
import { Unit } from "./unit";
import { Spawner } from "./spawner";
import { GroupsManager } from "./groupsManager";
import { Group } from "./group";
import { Faction, FrontGroundYLevel, Lane } from "./constants";
import { UnitsManager } from "./unitsManager";
import { PlayerUnit } from "./playerUnit";

export class MyLevel extends Scene {
    allUnits: Unit[] = [];
    allSpawners: Spawner[] = [];

    unitsManager: UnitsManager = new UnitsManager()
    groupsManager: GroupsManager = new GroupsManager();
    selectedUnit: Unit | null = null;
    playerGroup: Group | null = null;

    override onInitialize(engine: Engine): void {
        this.unitsManager.spawnPlayerUnit(this, vec(200, FrontGroundYLevel), "playerSoldier", Lane.Front, this.unitSelection, this.unitRightClick)
        this.unitsManager.spawnPlayerUnit(this, vec(300, FrontGroundYLevel), "playerSoldier", Lane.Front, this.unitSelection, this.unitRightClick)
        this.unitsManager.spawnEnemyUnit(this, vec(600, FrontGroundYLevel), "enemyZombie", Lane.Front)
        this.unitsManager.spawnEnemyUnit(this, vec(650, FrontGroundYLevel), "enemyZombie", Lane.Front)

        engine.input.pointers.primary.on('down', e => this.onMouseDown(e))
    }

    override onPreUpdate(engine: Engine, elapsed: number): void {
        const collisionsManager = this.unitsManager.collisionManager;
        collisionsManager.checkCollisions()
        const processedUnits: Set<Unit> = new Set();
        collisionsManager.collidingUnits.forEach((collidingWith, unit) => {
            if (collidingWith.length == 0) return
            if (processedUnits.has(unit)) return;

            let group: Group | undefined = undefined
            if (unit.groupRef !== null) {
                group = unit.groupRef
            } else {
                group = this.groupsManager.createGroup(unit)
            }
            collidingWith.forEach(x => {
                if (x.groupRef !== null) return;
                processedUnits.add(x)
                if (group !== undefined) {
                    this.groupsManager.addToGroup(x, group)
                    console.log(x + " added to group " + group)
                }
            })
            console.log(`${unit.id} colliding with ${collidingWith.map(u => u.id).join(', ')}`);

        });

        this.groupsManager.update()
    }

    onMouseDown(e: PointerEvent) {
        if (e.button === PointerButton.Right) {
            const selected = this.allUnits.filter(x => x.config.faction === Faction.Player && x instanceof PlayerUnit && x.isSelected)
            selected.forEach(x => {
                x.changeLane()
            })
        }
    }

    unitSelection(unit: Unit) {
        if(!(unit instanceof PlayerUnit)) return
        unit.isSelected = !unit.isSelected;
        if (unit.isSelected) {
            unit.select();
        } else {
            unit.deselect()
        }
    }

    unitRightClick(unit: Unit) {
        if (unit.lane === Lane.Front)
            unit.changeLane()
        else
            unit.changeLane()
    }
}