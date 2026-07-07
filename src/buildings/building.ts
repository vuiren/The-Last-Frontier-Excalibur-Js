import { Actor, ActorArgs, Color, Engine, vec } from "excalibur";
import { HorizontalDirection, Faction, Lane, GetScaleByLane } from "../constants";
import { ProgressBar } from "../progressBar";
import { Group } from "../group";
import { ICombatant } from "../combatant";
import { UnitActivity } from "../units/unit";
import { AnimComponent } from "../animComponent";
import { AsepriteResource } from "@excaliburjs/plugin-aseprite";

export class Building extends Actor implements ICombatant {
    health: number = 100;
    isDead: boolean = false;
    private healthBar: ProgressBar;
    faction: Faction;
    activity: UnitActivity = "idle";
    groupRef: Group | null = null;
    lane: Lane;
    attackPriority: number = 1;
    private animComponent: AnimComponent;

    constructor(config: ActorArgs, asepriteResouce: AsepriteResource, faction: Faction, health: number, lane: Lane) {
        super(config);
        this.faction = faction;
        this.health = health;
        this.lane = lane;
        this.healthBar = new ProgressBar(vec(this.pos.x - 8, lane === Lane.Front ? this.pos.y - 50 : this.pos.y - 25), 16, 4, 100, Color.DarkGray);
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
        console.warn("Buildings cannot change lanes");
    }

    takeDamage(damage: number, hitDirection: HorizontalDirection): void {
        if (this.isDead) return;
        this.health -= damage;
        this.healthBar.setValue(this.health);
        if (this.health <= 0) {
            this.onDeath();
        }
    }

    onDeath(): void {
        this.isDead = true;
        this.healthBar.kill();
        this.kill();
    }
}