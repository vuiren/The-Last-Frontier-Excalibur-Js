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
    attackPriority: number; // Higher value means higher priority as a target
    takeDamage(damage: number, hitDirection: HorizontalDirection): void;
    changeLane(targetX: number): void;
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
    onRoleInGroupChanged(): void;
    on(event: "died", handler: (x: any) => void): void;
    off(event: "died", handler: (x: any) => void): void;
}