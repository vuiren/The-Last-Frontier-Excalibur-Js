import { IGroupable } from "./combatant";

export class UnitsCollisionManager {
    allGroupables: IGroupable[] = [];
    groupCreationThreshold = 20;

    // Pre-allocated to worst case: n*(n-1)/2 pairs * 2
    collidingPairs: IGroupable[];
    collidingUnits: Map<IGroupable, IGroupable[]> = new Map();

    constructor(allCombatants: IGroupable[]) {
        this.allGroupables = allCombatants;
        this.collidingPairs = new Array(200); // way more than enough
        this.collidingPairs.length = 0;

        for (const unit of allCombatants) {
            this.collidingUnits.set(unit, []);
        }
    }

    checkCollisions() {
        this.collidingPairs.length = 0;

        // Reset each array instead of clearing the map
        for (const list of this.collidingUnits.values()) {
            list.length = 0;
        }

        const units = this.allGroupables.filter(x => x.activity !== "moving" && (x.groupRef === null || x.groupRef.leader.id === x.id));

        const len = units.length;

        for (let i = 0; i < len - 1; i++) {
            for (let j = i + 1; j < len; j++) {
                if (units[i].globalPos.distance(units[j].globalPos) <= this.groupCreationThreshold) {
                    this.collidingPairs.push(units[i], units[j]);
                    this.collidingUnits.get(units[i])!.push(units[j]);
                }
            }
        }
    }
}