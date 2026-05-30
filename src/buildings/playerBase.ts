import { Actor, vec, Vector } from "excalibur";
import { Direction, Faction } from "../constants";
import { HealthBar } from "../healthBar";
import { ICombatant } from "../combatant";
import { Group } from "../group";
import { UnitActivity } from "../unit";
import { Building } from "./building";

export class PlayerBase extends Building {
    health: number = 100;
    isDead: boolean = false;
    private healthBar: HealthBar;
    faction: Faction;
    activity: UnitActivity = "idle";
    groupRef: Group | null = null;

    constructor(startPosition: Vector, faction: Faction) {
        super(faction, {
            name: 'PlayerBase',
            pos: startPosition,
            width: 100,
            height: 100,
        });

        this.faction = faction;
        this.healthBar = new HealthBar(vec(0, 0), 50, 6, 100);
    }


    takeDamage(damage: number, hitDirection: Direction): void {
        if (this.isDead) return;
        this.health -= damage;
        this.healthBar.setHealth(this.health);
        if (this.health <= 0) {
            this.isDead = true;
            this.healthBar.kill();
            this.kill();
        }
    }
}