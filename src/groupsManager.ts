import { Group } from "./group";
import { Unit } from "./unit";

export class GroupsManager {
    private groups: Group[] = [];

    createGroup(leader: Unit): Group {
        this.removeFromAnyGroup(leader);
        const group = new Group(leader);
        this.groups.push(group);
        leader.joinGroup(group)
        leader.on("died", (x => {
            this.removeFromAnyGroup(leader)
        }))
        return group;
    }

    addToGroup(unit: Unit, group: Group): void {
        this.removeFromAnyGroup(unit);
        group.add(unit);
        unit.joinGroup(group)
        group.forceSpread = true

        unit.on("died", (x => {
            this.removeFromAnyGroup(unit)
        }))
    }

    removeFromAnyGroup(unit: Unit): void {
        const group = this.groupOf(unit);
        if (!group) return;

        group.remove(unit);
        unit.leaveGroup(group)
        unit.off("died")

        // Clean up dissolved groups (leader left with no followers)
        if (group.isEmpty) {
            group.leader.leaveGroup(group)
            group.leader.off("died")
            this.groups = this.groups.filter(g => g !== group);
        }
    }

    groupOf(unit: Unit): Group | undefined {
        return this.groups.find(g => g.members.includes(unit));
    }

    // Call this once per frame from the Scene
    update(): void {
        for (const group of this.groups) {
            group.update();
        }
    }
}