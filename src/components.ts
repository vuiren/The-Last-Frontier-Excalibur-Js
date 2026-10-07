// components.ts
import { Component } from "excalibur";
import { Building } from "./tacticalFight/buildings/building";
import { BuildTask } from "./tacticalFight/buildings/buildTask";
import { ICombatant, IGroupable } from "./tacticalFight/combatant";
import { Builder } from "./tacticalFight/units/cityUnits/builder";

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