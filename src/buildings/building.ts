import { Actor, ActorArgs, Engine, vec } from "excalibur";
import { HorizontalDirection, Faction, Lane, GetScaleByLane } from "../constants";
import { HealthBar } from "../healthBar";
import { Group } from "../group";
import { ICombatant } from "../combatant";
import { UnitActivity } from "../units/unit";
import { AnimComponent } from "../animComponent";
import { AsepriteResource } from "@excaliburjs/plugin-aseprite";

export class Building extends Actor implements ICombatant {
    health: number = 100;
    isDead: boolean = false;
    private healthBar: HealthBar;
    faction: Faction;
    activity: UnitActivity = "idle";
    groupRef: Group | null = null;
    lane: Lane;
    private animComponent: AnimComponent;


    constructor(config: ActorArgs, asepriteResouce: AsepriteResource, faction: Faction, health: number, lane: Lane) {
        super(config);
        this.faction = faction;
        this.health = health;
        this.lane = lane;
        this.healthBar = new HealthBar(vec(this.pos.x - 25, lane === Lane.Front ? this.pos.y - 150 : this.pos.y - 80), 50, 6, 100);
        this.animComponent = new AnimComponent(asepriteResouce);
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