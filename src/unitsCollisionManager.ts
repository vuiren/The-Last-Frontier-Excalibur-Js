import { IGroupable } from "./combatant";
import { Faction } from "./constants";
import { Group } from "./group";
import { GroupsManager } from "./groupsManager";

export class UnitsCollisionManager {
    groupsManager: GroupsManager;
    allGroupables: IGroupable[] = [];
    groupCreationThreshold = 12;

    // Pre-allocated to worst case: n*(n-1)/2 pairs * 2
    collidingPairs: IGroupable[];
    collidingUnits: Map<IGroupable, IGroupable[]> = new Map();
    private units: IGroupable[] = [];
    private thresholdSq = this.groupCreationThreshold ** 2;

    constructor(allCombatants: IGroupable[], groupsManager: GroupsManager) {
        this.allGroupables = allCombatants;
        this.groupsManager = groupsManager;
        this.collidingPairs = new Array(200); // way more than enough

        for (const unit of allCombatants) {
            this.collidingUnits.set(unit, []);
        }
    }

    checkCollisions() {
        this.collidingPairs.length = 0;

        for (const list of this.collidingUnits.values()) {
            list.length = 0;
        }

        this.units.length = 0;
        for (const x of this.allGroupables) {
            if (x.groupRef === null || (!x.groupRef.isFull && x.groupRef.leader.id === x.id)) this.units.push(x);
        }

        const len = this.units.length;

        for (let i = 0; i < len - 1; i++) {
            for (let j = i + 1; j < len; j++) {
                const unitA = this.units[i];
                const unitB = this.units[j];

                if (unitA.faction !== unitB.faction) continue;
                const bothInitialized = unitA.isInitialized && unitB.isInitialized
                if (!bothInitialized) continue

                if (unitA.globalPos.squareDistance(unitB.globalPos) > this.thresholdSq) continue;

                const eitherMoving = unitA.activity === "moving" || unitB.activity === "moving";
                if (unitA.faction === Faction.Player && eitherMoving) continue;

                // Register all eligible pairs — callers decide what to do with them
                this.collidingPairs.push(unitA, unitB);
                this.collidingUnits.get(unitA)!.push(unitB);
                this.collidingUnits.get(unitB)!.push(unitA);
            }
        }
    }

    mergeGroups(groupA: Group, groupB: Group, groupsManager: GroupsManager): void {
        const [target, source] = groupA.members.length >= groupB.members.length
            ? [groupA, groupB]
            : [groupB, groupA];

        for (const member of [...source.members]) {
            groupsManager.removeFromAnyGroup(member);
            groupsManager.addToGroup(member, target);
        }
    }
}