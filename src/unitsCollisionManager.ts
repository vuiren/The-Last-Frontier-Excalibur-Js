import { Unit } from "./unit";

export class UnitsCollisionManager {
    allUnits: Unit[] = [];
    groupCreationThreshold = 20;

    // Pre-allocated to worst case: n*(n-1)/2 pairs * 2
    collidingPairs: Unit[];
    collidingUnits: Map<Unit, Unit[]> = new Map();

    constructor(allUnits: Unit[]) {
        this.allUnits = allUnits;
        this.collidingPairs = new Array(200); // way more than enough
        this.collidingPairs.length = 0;

        for (const unit of allUnits) {
            this.collidingUnits.set(unit, []);
        }
    }

    addUnit(unit: Unit) {
        this.allUnits.push(unit);
        this.collidingUnits.set(unit, []);
    }

    removeUnit(unit: Unit) {
        this.allUnits.splice(this.allUnits.indexOf(unit), 1);
        this.collidingUnits.delete(unit);
    }

    checkCollisions() {
        this.collidingPairs.length = 0;

        // Reset each array instead of clearing the map
        for (const list of this.collidingUnits.values()) {
            list.length = 0;
        }

        const units = this.allUnits.filter(x => x.activity !== "moving" && (x.groupRef === null || x.groupRef.leader.id === x.id));

        const len = units.length;

        for (let i = 0; i < len - 1; i++) {
            for (let j = i + 1; j < len; j++) {
                if (units[i].pos.distance(units[j].pos) <= this.groupCreationThreshold) {
                    this.collidingPairs.push(units[i], units[j]);
                    this.collidingUnits.get(units[i])!.push(units[j]);
                }
            }
        }
    }
}