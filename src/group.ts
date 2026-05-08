import { Vector, vec } from "excalibur";
import { Unit } from "./unit";

const FORMATION_OFFSETS: Vector[] = [
    vec(45, 60), vec(-80, 60), vec(0, 60), vec(0, -60),
];

export class Group {
    leader: Unit;
    followers: Unit[] = [];

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
            const offset = FORMATION_OFFSETS[i] ?? vec((i + 1) * 60, 60);
            const target = this.leader.pos.add(offset)
            const distance = follower.pos.distance(this.leader.pos)
            if (distance > 80)
                follower.destination = target;
        });
    }
}