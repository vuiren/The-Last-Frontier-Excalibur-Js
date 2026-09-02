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
    Neutral = "NEUTRAL"
}

export const OWNER_LABEL: Record<Ownership, string> = {
    [Ownership.Player]: "Player",
    [Ownership.Enemy]: "Enemy",
    [Ownership.Neutral]: "Neutral",
};