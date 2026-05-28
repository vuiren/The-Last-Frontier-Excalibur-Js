import { Scene, Vector } from "excalibur";
import { Unit } from "./unit";
import { UnitsCollisionManager } from "./unitsCollisionManager";
import { EnemyUnit } from "./enemyUnit";
import { PlayerUnit } from "./playerUnit";
import { UnitConfigs, UnitConfigKey } from "./unitConfigs";
import { Lane } from "./constants";

export class UnitsManager {
    allUnits: Unit[] = [];
    collisionManager: UnitsCollisionManager;

    onUnitAdded?: (unit: Unit) => void;
    onUnitRemoved?: (unit: Unit) => void;

    constructor() {
        this.collisionManager = new UnitsCollisionManager(this.allUnits);
    }

    spawnPlayerUnit(
        scene: Scene,
        pos: Vector,
        configKey: UnitConfigKey,
        startLane: Lane,
        onUnitClick: (unit: Unit) => void,
        onUnitRightClick: (unit: Unit) => void,
    ) {
        const config = UnitConfigs[configKey];
        const unit = new PlayerUnit(pos, this.allUnits, config, onUnitClick, onUnitRightClick, startLane);
        unit.config.speed = config.speed;
        unit.config.detectionRange = config.detectionRange;
        unit.config.attackCooldown = config.attackCooldown;
        return this.registerUnit(scene, unit);
    }

    spawnEnemyUnit(scene: Scene, pos: Vector, configKey: UnitConfigKey, startLane: Lane) {
        const config = UnitConfigs[configKey];
        const unit = new EnemyUnit(pos, config, this.allUnits, startLane);
        unit.config.speed = config.speed;
        unit.config.detectionRange = config.detectionRange;
        unit.config.attackCooldown = config.attackCooldown;
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