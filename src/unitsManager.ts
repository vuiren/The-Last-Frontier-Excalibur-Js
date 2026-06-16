import { Scene, Vector } from "excalibur";
import { UnitsCollisionManager } from "./unitsCollisionManager";
import { EnemyUnit } from "./units/enemyUnit";
import { UnitConfigs, UnitConfigKey } from "./unitConfigs";
import { Lane } from "./constants";
import { ICombatant, IGroupable } from "./combatant";
import { PlayerUnit } from "./units/playerUnit";
import { Unit } from "./units/unit";
import { GroupsManager } from "./groupsManager";

export class UnitsManager {
    allCombatants: ICombatant[] = [];
    allGroupables: IGroupable[] = [];
    collisionManager: UnitsCollisionManager;

    onUnitAdded?: (unit: IGroupable) => void;
    onUnitRemoved?: (unit: IGroupable) => void;

    constructor(allCombatants: ICombatant[], allGroupables: IGroupable[], groupsManager: GroupsManager) {
        this.allCombatants = allCombatants;
        this.allGroupables = allGroupables;
        this.collisionManager = new UnitsCollisionManager(this.allGroupables, groupsManager);
    }

    spawnPlayerUnit(
        scene: Scene,
        pos: Vector,
        configKey: UnitConfigKey,
        startLane: Lane,
        onUnitClick: (unit: IGroupable) => void,
        onUnitRightClick: (unit: IGroupable) => void,
    ) {
        const config = UnitConfigs[configKey];
        const unit = new PlayerUnit(pos, this.allCombatants, config, onUnitClick, onUnitRightClick, this, startLane);
        unit.config.speed = config.speed;
        unit.config.detectionRange = config.detectionRange;
        unit.config.attackCooldown = config.attackCooldown;

        return this.registerUnit(scene, unit);
    }

    spawnEnemyUnit(scene: Scene, pos: Vector, configKey: UnitConfigKey, startLane: Lane) {
        const config = UnitConfigs[configKey];
        const unit = new EnemyUnit(pos, config, this.allCombatants, startLane);
        debugger;
        unit.config.speed = config.speed;
        unit.config.detectionRange = config.detectionRange;
        unit.config.attackCooldown = config.attackCooldown;

        return this.registerUnit(scene, unit);
    }

    private registerUnit(scene: Scene, unit: Unit) {
        this.allCombatants.push(unit);
        this.allGroupables.push(unit);
        this.collisionManager.collidingUnits.set(unit, []);
        this.onUnitAdded?.(unit);
        unit.on('died', (e) => this.removeUnit(e as IGroupable));
        scene.add(unit);
        return unit;
    }

    removeUnit(unit: IGroupable) {
        const index = this.allCombatants.indexOf(unit);
        if (index !== -1) this.allCombatants.splice(index, 1);

        const groupIndex = this.allGroupables.indexOf(unit);
        if (groupIndex !== -1) this.allGroupables.splice(groupIndex, 1);

        this.collisionManager.collidingUnits.delete(unit);
        this.onUnitRemoved?.(unit);
    }
}