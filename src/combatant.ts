import { Vector } from "excalibur";
import { Direction, Faction, Lane } from "./constants";
import { Group } from "./group";
import { UnitActivity } from "./unit";

export interface ICombatant {
    health: number;
    isDead: boolean;
    faction: Faction;
    globalPos: Vector;
    lane: Lane;
    takeDamage(damage: number, hitDirection: Direction): void;
    changeLane(): void;
}

export interface IGroupable extends ICombatant {
    id: number;
    activity: UnitActivity;
    lookDirection: Direction;
    groupRef: Group | null;
    moveTo(destination: Vector): void;
    joinGroup(group: Group): void;
    leaveGroup(group?: Group): void;
    on(event: "died", handler: (x: any) => void): void;
    off(event: "died"): void;
}