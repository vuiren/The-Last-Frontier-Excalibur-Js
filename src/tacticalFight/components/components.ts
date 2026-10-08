// components.ts
import { Component } from "excalibur";
import { Building } from "../buildings/building";
import { BuildTask } from "../buildings/buildTask";
import { ICombatant, IGroupable } from "../combatant";
import { Builder } from "../units/cityUnits/builder";
import { UnemployedUnit } from "../units/cityUnits/unemployed";

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
    constructor(public readonly task: BuildTask) { super(); }
}
export class BuilderComponent extends Component {
    constructor(public readonly builder: Builder) { super(); }
}
export class UnemployedUnitComponent extends Component {
    constructor(public readonly unemployed: UnemployedUnit) { super(); }
}