import { Scene, Vector } from "excalibur";
import { Unit } from "./unit";
import { UnitsCollisionManager } from "./unitsCollisionManager";
import { Lane } from "./constants";

export class UnitsManager {
    allUnits: Unit[] = [];
    collisionManager: UnitsCollisionManager;

    onUnitAdded?: (unit: Unit) => void;
    onUnitRemoved?: (unit: Unit) => void;

    constructor() {
        this.collisionManager = new UnitsCollisionManager(this.allUnits);
    }

    spawnUnit(scene: Scene, pos: Vector, onUnitClick: (unit: Unit) => void, onUnitRightClick: (unit: Unit) => void, isEnemy: boolean) {
        const unit = new Unit(pos, this.allUnits, onUnitClick, onUnitRightClick, isEnemy, Lane.Front, 5);

        this.allUnits.push(unit);
        this.collisionManager.collidingUnits.set(unit, []);
        this.onUnitAdded?.(unit);

        unit.on('died', (e) => {
            this.removeUnit(e as Unit);
        });

        scene.add(unit);
        return unit;
    }

    removeUnit(unit: Unit) {
        const index = this.allUnits.indexOf(unit);
        if (index !== -1) this.allUnits.splice(index, 1);
        this.collisionManager.collidingUnits.delete(unit);
        this.onUnitRemoved?.(unit);
    }
}