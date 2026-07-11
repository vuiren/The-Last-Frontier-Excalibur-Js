import { Scene } from "excalibur";
import { UnitsCollisionManager } from "./unitsCollisionManager";
import { ICombatant, IGroupable } from "./combatant";
import { Unit } from "./units/unit";
import { GroupsManager } from "./groupsManager";
import { OrderFlag } from "./buildings/orderFlag";
import { Faction } from "./constants";

export class UnitsManager {
    collisionManager: UnitsCollisionManager
    onUnitAdded?: (unit: IGroupable) => void;
    onUnitRemoved?: (unit: IGroupable) => void;

    constructor(
        private allCombatants: ICombatant[],
        private allGroupables: IGroupable[],
        private allOrderFlags: OrderFlag[],
        groupsManager: GroupsManager) {
        this.collisionManager = new UnitsCollisionManager(this.allGroupables, groupsManager);
    }

    registerUnit(scene: Scene, unit: Unit) {
        this.allCombatants.push(unit);
        this.allGroupables.push(unit);
        this.collisionManager.collidingUnits.set(unit, []);
        this.onUnitAdded?.(unit);
        unit.on('kill', () => this.removeUnit(unit));
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

    assignUnitsToFlags() {
        const playerUnits = this.allGroupables.filter(unit => unit.faction === Faction.Player);
        for (const orderFlag of this.allOrderFlags) {
            for (const unit of playerUnits) {
                const distance = unit.globalPos.distance(orderFlag.globalPos);
                if (distance <= orderFlag.range) {
                    // Assign the unit to the order flag
                    unit.moveTo(orderFlag.globalPos);
                }
            }
        }
    }
}