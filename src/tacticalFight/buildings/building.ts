import { Actor, ActorArgs, Color, Engine, vec, Vector } from "excalibur";
import { HorizontalDirection, Faction, Tags } from "../../constants";
import { ProgressBar } from "../../progressBar";
import { Group } from "../group";
import { ICombatant } from "../combatant";
import { UnitActivity } from "../units/unit";
import { AsepriteResource } from "@excaliburjs/plugin-aseprite";
import { CombatantComponent, BuildingComponent } from "../components/components";
import { AnimComponent } from "../components/animComponent";

export class Building extends Actor implements ICombatant {
    health: number = 100;
    isDead: boolean = false;
    faction: Faction;
    activity: UnitActivity = "idle";
    groupRef: Group | null = null;
    attackPriority: number = 1;

    private healthBar: ProgressBar;

    constructor(config: ActorArgs, asepriteResouce: AsepriteResource, faction: Faction, health: number, healthBarOffset: Vector = vec(-8, -45)) {
        super(config);
        this.faction = faction;
        this.health = health;

        this.healthBar = new ProgressBar(
            healthBarOffset,
            16, 4, health, health, Color.DarkGray
        );

        this.addChild(this.healthBar);

        this.addComponent(new CombatantComponent(this));
        this.addComponent(new BuildingComponent(this));
        this.addComponent(new AnimComponent(asepriteResouce))
    }

    override onInitialize(engine: Engine): void {
        this.get(AnimComponent).play("Idle");
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