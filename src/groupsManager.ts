import { IGroupable } from "./combatant";
import { Group } from "./group";

export class GroupsManager {
    groups: Group[] = [];

    createGroup(leader: IGroupable): Group {
        this.removeFromAnyGroup(leader);
        const group = new Group(leader);
        this.groups.push(group);
        leader.joinGroup(group)
        leader.on("died", (x => {
            this.removeFromAnyGroup(leader)
        }))
        return group;
    }

    addToGroup(unit: IGroupable, group: Group): void {
        this.removeFromAnyGroup(unit);
        group.add(unit);
        unit.joinGroup(group)
        group.forceSpread = true

        unit.on("died", (x => {
            this.removeFromAnyGroup(unit)
        }))
    }

    removeFromAnyGroup(unit: IGroupable): void {
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

    groupOf(unit: IGroupable): Group | undefined {
        return this.groups.find(g => g.members.includes(unit));
    }

    // Call this once per frame from the Scene
    update(): void {
        for (const group of this.groups) {
            group.update();
        }
    }
}