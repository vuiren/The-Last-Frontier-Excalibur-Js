import { vec, Vector } from "excalibur";

export const FrontGroundYLevel = 224
export const BackGroundYLevel = 128

export enum Lane {
    Front,
    Back,
}

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

export function GetYLevel(lane: Lane): number {
    return lane === Lane.Front ? FrontGroundYLevel : BackGroundYLevel;
}

export function GetLaneByYLevel(yLevel: number): Lane {
    return yLevel >= BackGroundYLevel ? Lane.Front : Lane.Back;
}

export function GetLaneYLevel(posY: number): number {
    return GetYLevel(GetLaneByYLevel(posY));
}

export function GetScaleByLane(lane: Lane): Vector {
    return lane === Lane.Front ? vec(1, 1) : vec(0.7, 0.7);
}

export function GetHealthBarScaleByLane(lane: Lane): Vector {
    return lane === Lane.Front ? vec(1, 1) : vec(0.75, 0.75);
}

export function GetMoveMarkerScaleByLane(lane: Lane): Vector {
    return lane === Lane.Front ? vec(1, 1) : vec(0.5, 0.5);
}