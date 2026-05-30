import { Actor, Engine, vec, Vector } from "excalibur";
import { HorizontalDirection, Faction, Lane, GetYLevel, GetScaleByLane } from "../constants";
import { HealthBar } from "../healthBar";
import { Group } from "../group";
import { ICombatant } from "../combatant";
import { UnitActivity } from "../units/unit";
import { AnimComponent } from "../animComponent";
import { Resources } from "../resources";

export class PlayerBase extends Actor implements ICombatant {
    health: number = 100;
    isDead: boolean = false;
    private healthBar: HealthBar;
    faction: Faction;
    activity: UnitActivity = "idle";
    groupRef: Group | null = null;
    lane: Lane;
    private animComponent: AnimComponent;


    constructor(startPosition: Vector, faction: Faction, health: number, lane: Lane) {
        startPosition = vec(startPosition.x, GetYLevel(lane));
        super({ name: 'PlayerBase', pos: startPosition, width: 48, height: 32, z: -2, anchor: vec(0.5, 1) });
        this.faction = faction;
        this.health = health;
        this.lane = lane;
        this.healthBar = new HealthBar(vec(this.pos.x - 25, lane === Lane.Front ? this.pos.y - 150 : this.pos.y - 80), 50, 6, 100);
        this.animComponent = new AnimComponent(Resources.PlayerBase);
        this.scale = GetScaleByLane(lane);
        this.healthBar.scale = this.lane === Lane.Front ? vec(1, 1) : vec(0.75, 0.75);
    }

    override onInitialize(engine: Engine): void {
        engine.currentScene.add(this.healthBar);
        this.playAnimation("Idle");
    }

    protected playAnimation(name: string): void {
        this.animComponent.play(name, this.graphics);
    }

    changeLane(): void {
        
    }

    takeDamage(damage: number, hitDirection: HorizontalDirection): void {
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