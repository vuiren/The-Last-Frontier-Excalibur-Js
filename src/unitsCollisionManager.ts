import { IGroupable } from "./combatant";
import { Faction } from "./constants";

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

        const units = this.allGroupables.filter(x => x.groupRef === null || x.groupRef.leader.id === x.id);

        const len = units.length;

        for (let i = 0; i < len - 1; i++) {
            for (let j = i + 1; j < len; j++) {
                const unitA = units[i];
                const unitB = units[j];

                if (unitA.lane !== unitB.lane) continue;

                if(unitA.groupRef !== null && unitB.groupRef !== null) {
                    console.log("Group leaders are colliding")
                }

                if (unitA.faction === Faction.Player && unitB.faction === Faction.Player) {
                    if (unitA.activity === "moving" || unitB.activity === "moving") continue;

                    if (unitA.globalPos.distance(unitB.globalPos) <= this.groupCreationThreshold) {
                        this.collidingPairs.push(unitA, unitB);
                        this.collidingUnits.get(unitA)!.push(unitB);
                    }
                }

                if (unitA.faction === Faction.Enemy && unitB.faction === Faction.Enemy) {

                    if (unitA.globalPos.distance(unitB.globalPos) <= this.groupCreationThreshold) {
                        console.log("Enemies are colliding")
                        this.collidingPairs.push(unitA, unitB);
                        this.collidingUnits.get(unitA)!.push(unitB);
                    }
                }

            }
        }
    }
}