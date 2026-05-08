import { Engine, Scene, vec, PointerEvent } from "excalibur";
import { Unit } from "./unit";
import { Spawner } from "./spawner";
import { GroupsManager } from "./groupsManager";
import { Group } from "./group";
import { FrontGroundYLevel, Lane } from "./constants";
import { UnitsManager } from "./unitsManager";

export class MyLevel extends Scene {
    allUnits: Unit[] = [];
    allSpawners: Spawner[] = [];

    unitsManager: UnitsManager = new UnitsManager()
    groupsManager: GroupsManager = new GroupsManager();
    selectedUnit: Unit | null = null;
    playerGroup: Group | null = null;

    override onInitialize(engine: Engine): void {
        this.unitsManager.spawnUnit(this, vec(200, FrontGroundYLevel), this.unitSelection, this.unitRightClick, false)
        this.unitsManager.spawnUnit(this, vec(300, FrontGroundYLevel), this.unitSelection, this.unitRightClick, false)
        this.unitsManager.spawnUnit(this, vec(600, FrontGroundYLevel), () => { }, () => { }, true)

        engine.input.pointers.primary.on('down', e => this.onMouseDown(e))
    }

    override onPreUpdate(engine: Engine, elapsed: number): void {
        const collisionsManager = this.unitsManager.collisionManager;
        collisionsManager.checkCollisions()
        collisionsManager.collidingUnits.forEach((collidingWith, unit) => {
            if (collidingWith.length > 0) {
                console.log(`${unit.id} colliding with ${collidingWith.map(u => u.id).join(', ')}`);
            }
        });
    }

    onMouseDown(e: PointerEvent) {
        if (e.button === "Right") {
            const selected = this.allUnits.filter(x => !x.isEnemy && x.isSelected)
            selected.forEach(x => {
                x.moveTo(e.worldPos)
            })
        }
    }

    unitSelection(unit: Unit) {
        unit.isSelected = !unit.isSelected;
        if (unit.isSelected) {
            unit.select();
        } else {
            unit.deselect()
        }
    }

    unitRightClick(unit: Unit) {
        if(unit.lane === Lane.Front)
            unit.changeLane(Lane.Back)
        else
            unit.changeLane(Lane.Front)
    }
}