import { Group } from "./group";
import { Unit } from "./unit";

export class GroupsManager {
    private groups: Group[] = [];

    createGroup(leader: Unit): Group {
        this.removeFromAnyGroup(leader);
        const group = new Group(leader);
        this.groups.push(group);
        return group;
    }

    addToGroup(unit: Unit, group: Group): void {
        this.removeFromAnyGroup(unit);
        group.add(unit);
    }

    removeFromAnyGroup(unit: Unit): void {
        const group = this.groupOf(unit);
        if (!group) return;

        group.remove(unit);

        // Clean up dissolved groups (leader left with no followers)
        if (group.isEmpty) {
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