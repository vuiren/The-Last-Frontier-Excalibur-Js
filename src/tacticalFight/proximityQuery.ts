import { Query, Vector } from "excalibur";
import { Faction } from "../constants";
import { ICombatant, IGroupable } from "./combatant";
import { CombatantComponent, GroupableComponent } from "../components";
import { UnitActivity } from "./units/unit";

export interface ProximityFilter {
    origin: Vector;
    radius: number;
    faction?: Faction;
    activity?: UnitActivity;
    excludeSelf?: IGroupable;
}

export function queryNearby(
    combatants: Query<typeof CombatantComponent>,
    filter: ProximityFilter
): ICombatant[] {
    const result: ICombatant[] = [];
    const radiusSq = filter.radius * filter.radius;

    for (const e of combatants.entities) {
        const c = e.get(CombatantComponent).combatant;
        if (filter.excludeSelf && c === filter.excludeSelf) continue;
        if (filter.faction !== undefined && c.faction !== filter.faction) continue;
        if (c.globalPos.squareDistance(filter.origin) > radiusSq) continue;
        result.push(c);
    }
    return result;
}

export function queryNearbyWithActivity(
    groupables: Query<typeof GroupableComponent>,
    filter: ProximityFilter
): IGroupable[] {
    const result: IGroupable[] = [];
    const radiusSq = filter.radius * filter.radius;

    for (const e of groupables.entities) {
        const c = e.get(GroupableComponent).groupable;
        if (filter.excludeSelf && c === filter.excludeSelf) continue;
        if (filter.faction !== undefined && c.faction !== filter.faction) continue;
        if (filter.activity !== undefined && c.activity !== filter.activity) continue;
        if (c.globalPos.squareDistance(filter.origin) > radiusSq) continue;
        result.push(c);
    }
    return result;
}