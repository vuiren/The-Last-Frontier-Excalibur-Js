import { Actor, Component, vec, Vector } from "excalibur";
import { UnemployedUnit } from "../units/cityUnits/unemployed";
import { VacantComponent } from "./components";
import { CityUnit } from "../units/cityUnits/cityUnit";

export class WorkplaceComponent extends Component {
    // One entry per slot; undefined = free
    private readonly slots: (CityUnit | undefined)[];

    constructor(
        private readonly workplace: Actor,
        private readonly spawnFunction: (posX: number, workplacePos: Vector, workplace: WorkplaceComponent) => CityUnit,
        readonly capacity = 1,
        private readonly spacing = 12, // px between workers
        private readonly yOffset = 0
    ) {
        super();
        this.slots = new Array(capacity).fill(undefined);
        this.workplace.addComponent(new VacantComponent());
    }

    get workers(): CityUnit[] {
        return this.slots.filter((s): s is CityUnit => s !== undefined);
    }

    get isFull(): boolean {
        return this.slots.every(s => s !== undefined);
    }

    hire(unit: UnemployedUnit): boolean {
        const slot = this.slots.indexOf(undefined);
        if (slot === -1 || unit.isKilled()) return false;

        unit.removeComponent(VacantComponent);

        const standingPosition = this.standingPosition(slot).add(vec(0, this.yOffset))
        const cityUnit = this.spawnFunction(unit.pos.x, standingPosition, this);
      //  cityUnit.workplace = this;
        this.slots[slot] = cityUnit;

        unit.kill();

        // Only close the job once the last slot is taken
        if (this.isFull) this.workplace.removeComponent(VacantComponent);
        return true;
    }

    /** Called by CityUnit when it dies; frees its slot and reopens the job */
    onWorkerLost(CityUnit: CityUnit) {
        const slot = this.slots.indexOf(CityUnit);
        if (slot === -1) return;

        this.slots[slot] = undefined;
        if (!this.workplace.has(VacantComponent)) {
            this.workplace.addComponent(new VacantComponent()); // re-triggers entityAdded$ in the manager
        }
    }

    /** Spreads workers evenly around the workplace's center */
    private standingPosition(slot: number) {
        const offset = (slot - (this.capacity - 1) / 2) * this.spacing;
        return this.workplace.pos.add(vec(offset, 0));
    }
}