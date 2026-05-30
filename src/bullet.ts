import { Actor, Engine, vec, Vector } from "excalibur";
import { Resources } from "./resources";
import { Direction, Faction, Lane } from "./constants";
import { ICombatant } from "./combatant";

export class Bullet extends Actor {
    direction: Vector;
    faction: Faction;
    speed = 300;
    gravity = 10;
    liveTime = 3000;
    allCombatants: ICombatant[] = [];
    lane: Lane = Lane.Front;
    hitDistance = 5;
    damage: number;

    constructor(startPosition: Vector, direction: Vector, allCombatants: ICombatant[], faction: Faction, damage: number, lane: Lane) {
        super({
            name: 'Bullet',
            pos: startPosition,
            width: 100,
            height: 100,
        });

        this.lane = lane;
        this.allCombatants = allCombatants;
        this.direction = direction;
        this.faction = faction
        this.damage = damage
    }

    override onInitialize() {
        this.graphics.add(Resources.Sword.toSprite());
        this.scale = vec(0.5, 0.5)
    }

    override onPreUpdate(engine: Engine, elapsedMs: number): void {
        if (!this.direction) return

        this.vel = this.direction.scale(this.speed)
        this.vel.y += this.gravity;
        this.liveTime -= elapsedMs;

        const hitTarget = this.allCombatants.find(x =>
            x.faction !== this.faction &&
            x.lane === this.lane &&
            Math.abs(x.globalPos.x - this.globalPos.x) <= this.hitDistance
        );

        if (hitTarget !== undefined) {
            console.log("Dealt damage")
            hitTarget.takeDamage(this.damage, this.direction.x > 0 ? Direction.Right : Direction.Left)
            this.kill()
        }

        if (this.liveTime < 0) {
            this.kill()
        }
    }
}
