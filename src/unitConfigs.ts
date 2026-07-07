import { AsepriteResource } from "@excaliburjs/plugin-aseprite";
import { AttackType, Faction } from "./constants";
import { Resources } from "./resources";

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
    graphicSource: AsepriteResource;
}

export const UnitConfigs = {
    playerSoldier: {
        health: 50,
        speed: 35,
        detectionRange: 60,
        attackCooldown: 500,
        attackType: AttackType.Ranged,
        faction: Faction.Player,
        attackDamage: 10,
        graphicSource: Resources.SoldierUnit,
    },

    enemyZombie: {
        health: 250,
        speed: 25,
        attackRange: 12,
        detectionRange: 50,
        attackCooldown: 700,
        attackType: AttackType.Melee,
        faction: Faction.Enemy,
        hitReactChance: 0.5,
        attackDamage: 5,
        graphicSource: Resources.SoldierZombie,
    },

} satisfies Record<string, UnitConfig>;

export type UnitConfigKey = keyof typeof UnitConfigs;