import { Scene, Vector } from "excalibur";
import { Unit } from "./unit";
import { UnitsCollisionManager } from "./unitsCollisionManager";
import { Lane } from "./constants";
import { EnemyUnit } from "./enemyUnit";
import { PlayerUnit } from "./playerUnit";

export class UnitsManager {
    allUnits: Unit[] = [];
    collisionManager: UnitsCollisionManager;

    onUnitAdded?: (unit: Unit) => void;
    onUnitRemoved?: (unit: Unit) => void;

    constructor() {
        this.collisionManager = new UnitsCollisionManager(this.allUnits);
    }

spawnPlayerUnit(scene: Scene, pos: Vector, startLane: Lane, onUnitClick: (unit: Unit) => void, onUnitRightClick: (unit: Unit) => void) {
    const unit = new PlayerUnit(pos, this.allUnits, onUnitClick, onUnitRightClick, startLane, 50);
    return this.registerUnit(scene, unit);
}

spawnEnemyUnit(scene: Scene, pos: Vector, startLane: Lane) {
    const unit = new EnemyUnit(pos, this.allUnits, startLane, 25);
    return this.registerUnit(scene, unit);
}

private registerUnit(scene: Scene, unit: Unit) {
    this.allUnits.push(unit);
    this.collisionManager.collidingUnits.set(unit, []);
    this.onUnitAdded?.(unit);
    unit.on('died', (e) => this.removeUnit(e as Unit));
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