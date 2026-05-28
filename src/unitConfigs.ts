import { AttackType, Faction } from "./constants";

export interface UnitConfig {
    health: number;
    speed: number;
    detectionRange: number;
    attackRange?: number; // if not provided, defaults to detectionRange
    attackCooldown: number;
    faction: Faction;
    attackType: AttackType;
    attackDamage: number;
    hitReactChance?: number; // 0 to 1, chance to react to being hit by moving towards the hit direction
}

export const UnitConfigs = {
    playerSoldier: {
        health: 50,
        speed: 250,
        detectionRange: 250,
        attackCooldown: 500,
        attackType: AttackType.Ranged,
        faction: Faction.Player,
        attackDamage: 10,
    },

    enemyZombie: {
        health: 250,
        speed: 200,
        attackRange: 50,
        detectionRange: 200,
        attackCooldown: 700,
        attackType: AttackType.Melee,
        faction: Faction.Enemy,
        hitReactChance: 0.5,
        attackDamage: 5,
    },

} satisfies Record<string, UnitConfig>;

export type UnitConfigKey = keyof typeof UnitConfigs;