import { Scene } from "excalibur";
import { UnitsCollisionManager } from "./unitsCollisionManager";
import { ICombatant, IGroupable } from "../combatant";
import { Unit } from "../units/unit";
import { GroupsManager } from "./groupsManager";

export class UnitsManager {
    collisionManager: UnitsCollisionManager
    onUnitAdded?: (unit: IGroupable) => void;
    onUnitRemoved?: (unit: IGroupable) => void;

    constructor(
        private allCombatants: ICombatant[],
        private allGroupables: IGroupable[],
        groupsManager: GroupsManager) {
        this.collisionManager = new UnitsCollisionManager(this.allGroupables, groupsManager);
    }

    registerUnit(scene: Scene, unit: Unit) {
        this.allCombatants.push(unit);
        this.allGroupables.push(unit);
        this.collisionManager.collidingUnits.set(unit, []);
        this.onUnitAdded?.(unit);
        unit.once('kill', () => this.removeUnit(unit));
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