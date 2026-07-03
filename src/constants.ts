import { vec, Vector } from "excalibur";

export const FrontGroundYLevel = 450
export const BackGroundYLevel = 200

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

export function GetScaleByLane(lane: Lane): Vector {
    return lane === Lane.Front ? vec(1, 1) : vec(0.5, 0.5);
}

export function GetHealthBarScaleByLane(lane: Lane): Vector {
    return lane === Lane.Front ? vec(1, 1) : vec(0.75, 0.75);
}

export function GetMoveMarkerScaleByLane(lane: Lane): Vector {
    return lane === Lane.Front ? vec(1, 1) : vec(0.5, 0.5);
}