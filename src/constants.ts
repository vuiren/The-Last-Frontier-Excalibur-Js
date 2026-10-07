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
    "Buildings": 1,
    "DeadUnits": 2,
    "CityUnits": 3,
    "UnitMoveMarkers": 4,
    "Units": 5,
    "Bullets": 6,
    "Barricades": 7,
};