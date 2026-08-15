import { vec } from "excalibur";
import { FrontGroundYLevel, HorizontalDirection } from "./constants";
import { IGroupable } from "./combatant";

const BASE_FORMATION_SPACING = 8; // Base distance between units in a formation
const FORMATION_SPREAD_THRESHOLD = 9; // Distance at which followers will start trying to catch up to the leader (prevents jitter when units are close but not perfectly aligned)  

function getFormationOffset(index: number): number {
    return BASE_FORMATION_SPACING * (index + 1);
}

export class Group {
    leader: IGroupable;
    followers: IGroupable[] = [];
    maxFollowersCount = 5
    private pendingSpread = false;

    constructor(leader: IGroupable) {
        this.leader = leader;
    }

    get members(): IGroupable[] {
        return [this.leader, ...this.followers];
    }

    get isEmpty(): boolean {
        return this.followers.length === 0;
    }

    get isFull(): boolean {
        return this.followers.length >= this.maxFollowersCount
    }

    spreadNow(): void {
        this.pendingSpread = true;
    }

    add(unit: IGroupable): void {
        if (unit === this.leader || this.followers.includes(unit)) return;
        this.followers.push(unit);
    }

    remove(unit: IGroupable): void {
        if (unit === this.leader) {
            const next = this.followers.shift();
            if (next) {
                this.leader = next;            
                this.leader.moveTo(this.leader.globalPos);
                this.leader.onRoleInGroupChanged();
                this.spreadNow();
            }
        } else {
            const idx = this.followers.indexOf(unit);
            if (idx !== -1) this.followers.splice(idx, 1);
        }
    }

    // Called each frame — sets follower destinations relative to the leader
    update(): void {
        const facingSign = this.leader.lookDirection === HorizontalDirection.Right ? -1 : 1;

        for (const [i, follower] of this.followers.entries()) {
            const offsetX = getFormationOffset(i) * facingSign;
            const target = this.leader.globalPos.add(vec(offsetX, 0));
            target.y = FrontGroundYLevel;
            const distance = follower.globalPos.distance(this.leader.globalPos);

            if (distance > FORMATION_SPREAD_THRESHOLD || this.pendingSpread) {
                follower.moveTo(target);
            }
        }

        this.pendingSpread = false;
    }
}