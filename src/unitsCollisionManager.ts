import { IGroupable } from "./combatant";
import { Faction } from "./constants";
import { Group } from "./group";
import { GroupsManager } from "./groupsManager";

export class UnitsCollisionManager {
    groupsManager: GroupsManager;
    allGroupables: IGroupable[] = [];
    groupCreationThreshold = 20;

    // Pre-allocated to worst case: n*(n-1)/2 pairs * 2
    collidingPairs: IGroupable[];
    collidingUnits: Map<IGroupable, IGroupable[]> = new Map();

    constructor(allCombatants: IGroupable[], groupsManager: GroupsManager) {
        this.allGroupables = allCombatants;
        this.groupsManager = groupsManager;
        this.collidingPairs = new Array(200); // way more than enough
        this.collidingPairs.length = 0;

        for (const unit of allCombatants) {
            this.collidingUnits.set(unit, []);
        }
    }

    checkCollisions() {
        this.collidingPairs.length = 0;

        for (const list of this.collidingUnits.values()) {
            list.length = 0;
        }

        // Only ungrouped units or group leaders are eligible (to allow group merging)
        const units = this.allGroupables.filter(
            x => x.groupRef === null || x.groupRef.leader.id === x.id
        );

        const len = units.length;

        for (let i = 0; i < len - 1; i++) {
            for (let j = i + 1; j < len; j++) {
                const unitA = units[i];
                const unitB = units[j];

                if (unitA.lane !== unitB.lane) continue;
                if (unitA.faction !== unitB.faction) continue;

                const dist = unitA.globalPos.distance(unitB.globalPos);
                if (dist > this.groupCreationThreshold) continue;

                // Don't form groups while a player-faction unit is still moving
                const eitherMoving = unitA.activity === "moving" || unitB.activity === "moving";
                if (unitA.faction === Faction.Player && eitherMoving) continue;

                // Both are group leaders — merge groups
                if (unitA.groupRef !== null && unitB.groupRef !== null) {
                    this.mergeGroups(unitA.groupRef, unitB.groupRef, this.groupsManager);
                    continue;
                }

                // Register the collision on both sides
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

        // source leader also joins the winning group
        groupsManager.removeFromAnyGroup(source.leader);
        groupsManager.addToGroup(source.leader, target);
    }
}