import { Actor, ActorArgs, Color, Engine, vec } from "excalibur";
import { HorizontalDirection, Faction } from "../constants";
import { ProgressBar } from "../progressBar";
import { Group } from "../group";
import { ICombatant } from "../combatant";
import { UnitActivity } from "../units/unit";
import { AnimComponent } from "../animComponent";
import { AsepriteResource } from "@excaliburjs/plugin-aseprite";

export class Building extends Actor implements ICombatant {
    health: number = 100;
    isDead: boolean = false;
    faction: Faction;
    activity: UnitActivity = "idle";
    groupRef: Group | null = null;
    attackPriority: number = 1;

    private animComponent: AnimComponent;
    private healthBar: ProgressBar;

    constructor(config: ActorArgs, asepriteResouce: AsepriteResource, faction: Faction, health: number) {
        super(config);
        this.faction = faction;
        this.health = health;
        this.animComponent = new AnimComponent(asepriteResouce);

        this.healthBar = new ProgressBar(
            vec(-8, -45),
            16, 4, health, health, Color.DarkGray
        );

        this.addChild(this.healthBar);
    }

    override onInitialize(engine: Engine): void {
        this.playAnimation("Idle");
    }

    protected playAnimation(name: string): void {
        this.animComponent.play(name, this.graphics);
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
        this.kill();
    }
}