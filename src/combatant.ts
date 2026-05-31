import { Vector } from "excalibur";
import { HorizontalDirection, Faction, Lane } from "./constants";
import { Group } from "./group";
import { UnitActivity } from "./units/unit";

export interface ICombatant {
    health: number;
    isDead: boolean;
    faction: Faction;
    globalPos: Vector;
    lane: Lane;
    takeDamage(damage: number, hitDirection: HorizontalDirection): void;
    changeLane(): void;
}

export interface IGroupable extends ICombatant {
    id: number;
    activity: UnitActivity;
    lookDirection: HorizontalDirection;
    groupRef: Group | null;
    orderedDestination: Vector;
    moveTo(destination: Vector): void;
    joinGroup(group: Group): void;
    leaveGroup(group?: Group): void;
    on(event: "died", handler: (x: any) => void): void;
    off(event: "died"): void;
}