import { Vector } from "excalibur";
import { Faction, Lane } from "./constants";
import { ICombatant, IGroupable } from "./combatant";
import { UnitActivity } from "./units/unit";

export interface ProximityFilter {
    origin: Vector;
    radius: number;
    lane?: Lane;
    faction?: Faction;
    activity?: UnitActivity;
    excludeSelf?: IGroupable;
}

export function queryNearby(
    candidates: ICombatant[],
    filter: ProximityFilter
): ICombatant[] {
    return candidates.filter(c => {
        if (filter.excludeSelf && c === filter.excludeSelf) return false;
        if (filter.lane !== undefined && c.lane !== filter.lane) return false;
        if (filter.faction !== undefined && c.faction !== filter.faction) return false;
        if (c.globalPos.distance(filter.origin) > filter.radius) return false;
        return true;
    });
}

export function queryNearbyWithActivity(
    candidates: IGroupable[],
    filter: ProximityFilter
): IGroupable[] {
    return candidates.filter(c => {
        if (filter.excludeSelf && c === filter.excludeSelf) return false;
        if (filter.lane !== undefined && c.lane !== filter.lane) return false;
        if (filter.faction !== undefined && c.faction !== filter.faction) return false;
        if (filter.activity !== undefined && c.activity !== filter.activity) return false;
        if (c.globalPos.distance(filter.origin) > filter.radius) return false;
        return true;
    });
}