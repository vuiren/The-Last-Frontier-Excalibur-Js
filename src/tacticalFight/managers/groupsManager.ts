import { IGroupable } from "../combatant";
import { Group } from "../group";

export class GroupsManager {
    groups: Group[] = [];
    private diedHandlers = new Map<IGroupable, () => void>();

    createGroup(leader: IGroupable): Group {
        this.removeFromAnyGroup(leader);
        const group = new Group(leader);
        this.groups.push(group);
        leader.joinGroup(group);
        this.registerDiedHandler(leader);
        return group;
    }

    addToGroup(unit: IGroupable, group: Group): void {
        this.removeFromAnyGroup(unit);
        group.add(unit);
        unit.joinGroup(group);
        group.spreadNow();
        this.registerDiedHandler(unit);
    }

    removeFromAnyGroup(unit: IGroupable): void {
        const group = this.groupOf(unit);
        if (!group) return;

        group.remove(unit);
        unit.leaveGroup(group);
        this.unregisterDiedHandler(unit);

        // Clean up dissolved groups (leader left with no followers)
        if (group.isEmpty) {
            group.leader.leaveGroup(group);
            this.unregisterDiedHandler(group.leader);
            this.groups = this.groups.filter(g => g !== group);
        }
    }

    groupOf(unit: IGroupable): Group | undefined {
        return this.groups.find(g => g.members.includes(unit));
    }

    update(): void {
        for (const group of this.groups) {
            group.update();
        }
    }

    private registerDiedHandler(unit: IGroupable): void {
        // Guard against double-registration if somehow called twice for the same unit
        this.unregisterDiedHandler(unit);

        const handler = () => this.removeFromAnyGroup(unit);
        this.diedHandlers.set(unit, handler);
        unit.on("died", handler);
    }

    private unregisterDiedHandler(unit: IGroupable): void {
        const handler = this.diedHandlers.get(unit);
        if (!handler) return;

        unit.off("died", handler);
        this.diedHandlers.delete(unit);
    }
}