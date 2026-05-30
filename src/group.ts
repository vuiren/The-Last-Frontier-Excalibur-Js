import { vec } from "excalibur";
import { HorizontalDirection } from "./constants";
import { IGroupable } from "./combatant";

const FORMATION_OFFSETS: number[] = [
    35, 70, 105
];

export class Group {
    leader: IGroupable;
    followers: IGroupable[] = [];
    forceSpread: true | null = null

    constructor(leader: IGroupable) {
        this.leader = leader;
    }

    get members(): IGroupable[] {
        return [this.leader, ...this.followers];
    }

    get isEmpty(): boolean {
        return this.followers.length === 0;
    }

    add(unit: IGroupable): void {
        if (unit === this.leader || this.followers.includes(unit)) return;
        this.followers.push(unit);
    }

    remove(unit: IGroupable): void {
        if (unit === this.leader) {
            // Promote first follower, or group naturally dissolves
            const next = this.followers.shift();
            if (next) this.leader = next;
        } else {
            const idx = this.followers.indexOf(unit);
            if (idx !== -1) this.followers.splice(idx, 1);
        }
    }

    // Called each frame — sets follower destinations relative to the leader
    update(): void {
        this.followers.forEach((follower, i) => {
            let offset = FORMATION_OFFSETS[i] ?? vec((i + 1) * 60, 60);
            offset *= this.leader.lookDirection === HorizontalDirection.Right ? -1 : 1
            const target = this.leader.globalPos.add(vec(offset, 0))
            const distance = follower.globalPos.distance(this.leader.globalPos)
            if (distance > 80 || this.forceSpread)
                follower.moveTo(target)
        });

        if (this.forceSpread !== null)
            this.forceSpread = null
    }
}