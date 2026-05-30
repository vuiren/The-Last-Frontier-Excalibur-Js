import { Actor, ActorArgs, vec } from "excalibur";
import { Direction, Faction } from "../constants";
import { HealthBar } from "../healthBar";
import { ICombatant } from "../combatant";
import { Group } from "../group";
import { UnitActivity } from "../unit";

export class Building extends Actor implements ICombatant {
    health: number = 100;
    isDead: boolean = false;
    private healthBar: HealthBar;
    faction: Faction;
    activity: UnitActivity = "idle";
    groupRef: Group | null = null;

    constructor(faction: Faction, health: number, config?: ActorArgs) {
        super(config);

        this.faction = faction;
        this.health = health;
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