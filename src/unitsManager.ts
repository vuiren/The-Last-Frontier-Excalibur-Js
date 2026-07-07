import { Scene } from "excalibur";
import { UnitsCollisionManager } from "./unitsCollisionManager";
import { ICombatant, IGroupable } from "./combatant";
import { Unit } from "./units/unit";
import { GroupsManager } from "./groupsManager";

export class UnitsManager {
    allCombatants: ICombatant[] = [];
    allGroupables: IGroupable[] = [];
    collisionManager: UnitsCollisionManager;
    groupsManager: GroupsManager;

    onUnitAdded?: (unit: IGroupable) => void;
    onUnitRemoved?: (unit: IGroupable) => void;

    constructor(allCombatants: ICombatant[], allGroupables: IGroupable[], groupsManager: GroupsManager) {
        this.allCombatants = allCombatants;
        this.allGroupables = allGroupables;
        this.collisionManager = new UnitsCollisionManager(this.allGroupables, groupsManager);
        this.groupsManager = groupsManager;
    }

    registerUnit(scene: Scene, unit: Unit) {
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