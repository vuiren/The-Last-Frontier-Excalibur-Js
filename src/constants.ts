import { Vector } from "excalibur";

export const FrontGroundYLevel = 224

export enum HorizontalDirection {
    Left,
    Right
}

export enum Faction {
    Player,
    Enemy
}

export enum AttackType {
    Melee,
    Ranged
}

export enum Ownership {
    Player = "PLAYER",
    Enemy = "ENEMY",
    Neutral = "NEUTRAL",
    Contested = "CONTESTED"
}

export enum Turn {
    Player = "PLAYER",
    Enemy = "ENEMY",
    Fight = "FIGHT"
}

export const OWNER_LABEL: Record<Ownership, string> = {
    [Ownership.Player]: "Player",
    [Ownership.Enemy]: "Enemy",
    [Ownership.Neutral]: "Neutral",
    [Ownership.Contested]: "Contested",
};

export const TURN_LABEL: Record<Turn, string> = {
    [Turn.Player]: "Player",
    [Turn.Enemy]: "Enemy",
    [Turn.Fight]: "Fight",
};

export const zLabels: Record<string, number> = {
    "Default": 0,
    "TreesBackground": 1,
    "Buildings": 2,
    "DeadUnits": 3,
    "CityUnits": 4,
    "UnitMoveMarkers": 5,
    "Units": 6,
    "TreesForeground": 7,
    "Bullets": 8,
    "Barricades": 9,
};

export type TransitionEntry = { action?: () => void; delay?: number };

export function destinationReached(pos: Vector, destination: Vector, threashold: number = 1) {
    return Math.abs(destination.x - pos.x) < threashold
}