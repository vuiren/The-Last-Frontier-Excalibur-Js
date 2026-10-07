import { IGroupable } from "../combatant";
import { Faction } from "../../constants";
import { Group } from "../group";
import { GroupsManager } from "./groupsManager";
import { Entity, Query, Scene } from "excalibur";
import { GroupableComponent } from "../../components";

export class UnitsCollisionManager {
    groupCreationThreshold = 12;

    collidingPairs: IGroupable[] = [];
    collidingUnits: Map<IGroupable, IGroupable[]> = new Map();

    private readonly groupables: Query<typeof GroupableComponent>;
    private units: IGroupable[] = [];
    private thresholdSq = this.groupCreationThreshold ** 2;

    constructor(scene: Scene, private readonly groupsManager: GroupsManager) {
        this.groupables = scene.world.query([GroupableComponent]);

        // anything already in the world, then follow changes
        for (const e of this.groupables.entities) this.track(e);
        this.groupables.entityAdded$.subscribe(e => this.track(e));
        this.groupables.entityRemoved$.subscribe(e => {
            this.collidingUnits.delete(e.get(GroupableComponent).groupable);
        });
    }

    private track(e: Entity<any>) {
        this.collidingUnits.set(e.get(GroupableComponent).groupable, []);
    }

    checkCollisions() {
        this.collidingPairs.length = 0;

        for (const list of this.collidingUnits.values()) {
            list.length = 0;
        }

        this.units.length = 0;
        for (const e of this.groupables.entities) {
            const x = e.get(GroupableComponent).groupable;
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

    mergeGroups(groupA: Group, groupB: Group): void {
        const [target, source] = groupA.members.length >= groupB.members.length
            ? [groupA, groupB]
            : [groupB, groupA];

        for (const member of [...source.members]) {
            this.groupsManager.removeFromAnyGroup(member);
            this.groupsManager.addToGroup(member, target);
        }
    }
}