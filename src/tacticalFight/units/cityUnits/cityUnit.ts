import { Actor, ActorArgs, Engine, Vector } from "excalibur";
import { Faction, HorizontalDirection } from "../../../constants";
import { ICombatant } from "../../combatant";
import { AsepriteResource } from "@excaliburjs/plugin-aseprite";
import { AnimComponent } from "../../components/animComponent";
import { CombatantComponent } from "../../components/components";

export class CityUnit extends Actor implements ICombatant {
    health: number;
    isDead: boolean = false;
    faction: Faction;
    attackPriority: number;

    destination: Vector;

    constructor(config: ActorArgs, graphics: AsepriteResource, health: number, faction: Faction, attackPriority: number) {
        super(config)
        this.health = health;
        this.faction = faction
        this.attackPriority = attackPriority

        this.destination = this.globalPos

        this.addComponent(new AnimComponent(graphics));
        this.addComponent(new CombatantComponent(this));
    }

    override onInitialize(engine: Engine): void {
        this.playAnimation("Idle")
    }

    takeDamage(damage: number, hitDirection: HorizontalDirection): void {
        throw new Error("Method not implemented.");
    }

    setDestination(destination: Vector) {
        this.destination = destination
    }

    protected playAnimation(name: string) { this.get(AnimComponent).play(name); }
}