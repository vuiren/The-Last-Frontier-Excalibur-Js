// components.ts
import { Component, Entity, Vector } from "excalibur";
import { Building } from "../buildings/building";
import { BuildTask } from "../buildTasks/buildTask";
import { ICombatant, IGroupable } from "../combatant";
import { Builder } from "../units/cityUnits/builder";
import { UnemployedUnit } from "../units/cityUnits/unemployed";
import { InGameLabel } from "../ingameLabel";

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
    constructor(public readonly unemployed: UnemployedUnit) { super(); }
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
}