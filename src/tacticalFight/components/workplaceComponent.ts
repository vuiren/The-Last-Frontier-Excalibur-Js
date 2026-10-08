import { Actor, Component, vec } from "excalibur";
import { Tags } from "../../constants";
import type { EntitySpawner } from "../entitySpawner";
import type { Builder } from "../units/cityUnits/builder";
import { UnemployedUnit } from "../units/cityUnits/unemployed";

export class WorkplaceComponent extends Component {
    // One entry per slot; undefined = free
    private readonly slots: (Builder | undefined)[];

    constructor(
        private readonly workplace: Actor,
        private readonly spawner: EntitySpawner,
        readonly capacity = 1,
        private readonly spacing = 12, // px between workers
    ) {
        super();
        this.slots = new Array(capacity).fill(undefined);
        this.workplace.addTag(Tags.Vacant);
    }

    get workers(): Builder[] {
        return this.slots.filter((s): s is Builder => s !== undefined);
    }

    get isFull(): boolean {
        return this.slots.every(s => s !== undefined);
    }

    hire(unit: UnemployedUnit): boolean {
        const slot = this.slots.indexOf(undefined);
        if (slot === -1 || unit.isKilled()) return false;

        unit.removeTag(Tags.Vacant);

        const standingPosition = this.standingPosition(slot)
        const builder = this.spawner.spawnBuilder(unit.pos.x, standingPosition);
        builder.workplace = this;
        this.slots[slot] = builder;

        unit.kill();

        // Only close the job once the last slot is taken
        if (this.isFull) this.workplace.removeTag(Tags.Vacant);
        return true;
    }

    /** Called by Builder when it dies; frees its slot and reopens the job */
    onWorkerLost(builder: Builder) {
        const slot = this.slots.indexOf(builder);
        if (slot === -1) return;

        this.slots[slot] = undefined;
        if (!this.workplace.hasTag(Tags.Vacant)) {
            this.workplace.addTag(Tags.Vacant); // re-triggers entityAdded$ in the manager
        }
    }

    /** Spreads workers evenly around the workplace's center */
    private standingPosition(slot: number) {
        const offset = (slot - (this.capacity - 1) / 2) * this.spacing;
        return this.workplace.pos.add(vec(offset, 0));
    }
}