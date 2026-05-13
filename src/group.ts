import { Vector, vec } from "excalibur";
import { Unit } from "./unit";
import { Direction } from "./constants";

const FORMATION_OFFSETS: number[] = [
    35, 70, 105
];

export class Group {
    leader: Unit;
    followers: Unit[] = [];
    forceSpread: true | null = null

    constructor(leader: Unit) {
        this.leader = leader;
    }

    get members(): Unit[] {
        return [this.leader, ...this.followers];
    }

    get isEmpty(): boolean {
        return this.followers.length === 0;
    }

    add(unit: Unit): void {
        if (unit === this.leader || this.followers.includes(unit)) return;
        this.followers.push(unit);
    }

    remove(unit: Unit): void {
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
            offset *= this.leader.lookDirection === Direction.Right ? -1 : 1
            const target = this.leader.pos.add(vec(offset, 0))
            const distance = follower.pos.distance(this.leader.pos)
            if (distance > 80 || this.forceSpread)
                follower.moveTo(target, false)
        });

        if (this.forceSpread !== null)
            this.forceSpread = null
    }
}