// components.ts
import { Component, Entity, TransformComponent, vec, Vector } from "excalibur";
import { Building } from "../buildings/building";
import { BuildTask } from "../buildTasks/buildTask";
import { ICombatant, IGroupable } from "../combatant";
import { Builder } from "../units/cityUnits/builder";
import { UnemployedUnit } from "../units/cityUnits/unemployed";
import { InGameLabel } from "../inGameLabel";
import { CityUnit } from "../units/cityUnits/cityUnit";

export class CombatantComponent extends Component {
    constructor(public readonly combatant: ICombatant) { super(); }
}
export class GroupableComponent extends Component {
    constructor(public readonly groupable: IGroupable) { super(); }
}
export class BuildingComponent extends Component {
    constructor(public readonly building: Building) { super(); }
}
export class BuildTaskComponent extends Component {
    deliveredWoodAmount = 0;

    constructor(public readonly requiredWoodAmount: number) { super(); }

    get remainingWood(): number {
        return Math.max(0, this.requiredWoodAmount - this.deliveredWoodAmount);
    }

    get hasAllWood(): boolean {
        return this.deliveredWoodAmount >= this.requiredWoodAmount;
    }

    deliver(amount: number): number {
        const accepted = Math.min(amount, this.remainingWood);
        this.deliveredWoodAmount += accepted;
        return accepted; // how much was actually used, so the worker keeps the rest
    }
}
export class BuilderComponent extends Component {
    constructor(public readonly builder: Builder) { super(); }
}
export class UnemployedUnitComponent extends Component {
    constructor(public readonly unemployed: UnemployedUnit, public foundPlace: boolean) { super(); }
}
export class AssignedTaskComponent extends Component {
    constructor(public readonly task: BuildTask) { super(); }
}
export class ClaimedTaskComponent extends Component {
    constructor(public readonly task: BuildTask) { super(); }
}
export class VacantComponent extends Component { }

export class WoodStorageComponent extends Component {
    private storedWoodAmount: number = 0;

    constructor(public readonly building: Building) {
        super();
    }

    addWood(amount: number) {
        this.storedWoodAmount += amount
    }

    takeWood(amount: number) {
        this.storedWoodAmount -= amount
    }

    get woodAmount() {
        return this.storedWoodAmount
    }

    gotEnoughWood(requiredAmount: number) {
        return this.storedWoodAmount >= requiredAmount
    }
}

export class LabelComponent extends Component {
    private label: InGameLabel
    private lastText = ''

    constructor(offset: Vector, private getText: () => string, size = 12) {
        super()
        this.label = new InGameLabel({ pos: offset }, size)
    }

    override onAdd(owner: Entity) {
        owner.addChild(this.label)
    }

    override onRemove() {
        this.label.kill()
    }

    refresh() {
        const text = this.getText()
        if (text !== this.lastText) {
            this.lastText = text
            this.label.text = text
        }
    }

    delay: number = 1000

    show(): void {
        this.label.show()
    }

    hide(): void {
        this.label.hide()
    }
}


export class TreeComponent extends Component {
    private remainingWood: number;
    private claimedBy?: Entity;

    constructor(public readonly totalWood: number) {
        super();
        this.remainingWood = totalWood;
    }

    get woodLeft() { return this.remainingWood; }
    get isDepleted() { return this.remainingWood <= 0; }

    /** True if some worker is currently assigned to this tree (and is still alive). */
    get isClaimed() { return this.claimedBy !== undefined && !this.claimedBy.isKilled(); }

    /** Reserves the tree for a worker. Returns false if somebody else already holds it. */
    claim(by: Entity): boolean {
        if (this.isClaimed && this.claimedBy !== by) return false;
        this.claimedBy = by;
        return true;
    }

    release(by: Entity) {
        if (this.claimedBy === by) this.claimedBy = undefined;
    }

    /** Removes up to `amount` wood and returns how much was actually taken. */
    takeWood(amount: number): number {
        const taken = Math.max(0, Math.min(amount, this.remainingWood));
        this.remainingWood -= taken;
        return taken;
    }
}

export enum PickableType {
    Log
}

export class PickableResourceComponent extends Component {
    constructor(public pickableType: PickableType, private amount: number) {
        super()
    }

    getResource(carryCapacity: number) {
        const takeAmount = Math.min(this.amount, carryCapacity)
        this.amount -= takeAmount

        if (this.amount <= 0)
            this.owner?.kill()

        return takeAmount
    }
}

export class WorkplaceComponent extends Component {
    // One entry per slot; undefined = free
    private readonly slots: (CityUnit | undefined)[];

    constructor(
        private readonly spawnFunction: (posX: number, workplacePos: Vector, workplace: WorkplaceComponent) => CityUnit,
        readonly capacity = 1,
        private readonly spacing = 12, // px between workers
        private readonly yOffset = 0
    ) {
        super();
        this.slots = new Array(capacity).fill(undefined);
        this.owner?.addComponent(new VacantComponent());
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
        this.slots[slot] = cityUnit;

        unit.kill();

        // Only close the job once the last slot is taken
        if (this.isFull) this.owner?.removeComponent(VacantComponent);
        return true;
    }

    /** Called by CityUnit when it dies; frees its slot and reopens the job */
    onWorkerLost(CityUnit: CityUnit) {
        const slot = this.slots.indexOf(CityUnit);
        if (slot === -1) return;

        this.slots[slot] = undefined;
        if (!this.owner?.has(VacantComponent)) {
            this.owner?.addComponent(new VacantComponent()); // re-triggers entityAdded$ in the manager
        }
    }

    /** Spreads workers evenly around the workplace's center */
    private standingPosition(slot: number) {
        const offset = (slot - (this.capacity - 1) / 2) * this.spacing;
        if (this.owner !== undefined) {
            return this.owner.get(TransformComponent).pos.add(vec(offset, 0));
        }
        return vec(0, 0)
    }
}

export class UnemployedPlaceComponent extends Component {
    // One entry per slot; undefined = free
    private readonly slots: (CityUnit | undefined)[];

    constructor(
        readonly capacity = 1,
        private readonly spacing = 12, // px between workers
        private readonly yOffset = 0
    ) {
        super();
        this.slots = new Array(capacity).fill(undefined);
        this.owner?.addComponent(new VacantComponent());
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

        const standingPosition = this.standingPosition(slot).add(vec(0, this.yOffset))
        unit.setDestination(standingPosition)
        this.slots[slot] = unit;

        if (this.isFull) this.owner?.removeComponent(VacantComponent);
        return true;
    }

    /** Called by CityUnit when it dies; frees its slot and reopens the job */
    onWorkerLost(CityUnit: CityUnit) {
        const slot = this.slots.indexOf(CityUnit);
        if (slot === -1) return;

        this.slots[slot] = undefined;
        if (!this.owner?.has(VacantComponent)) {
            this.owner?.addComponent(new VacantComponent()); // re-triggers entityAdded$ in the manager
        }
    }

    /** Spreads workers evenly around the workplace's center */
    private standingPosition(slot: number) {
        const offset = (slot - (this.capacity - 1) / 2) * this.spacing;
        if (this.owner !== undefined) {
            return this.owner.get(TransformComponent).pos.add(vec(offset, 0));
        }
        return vec(0, 0)
    }
}

export class CutOrderComponent extends Component {}
export class DemolishOrderComponent extends Component {}