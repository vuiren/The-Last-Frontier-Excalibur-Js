import { Actor, CollisionType, Color, Engine, vec, Vector } from "excalibur";
import { HorizontalDirection, Faction } from "../constants";
import { ICombatant } from "../combatant";

export class Bullet extends Actor {
    direction: Vector;
    faction: Faction;
    speed = 300;
    gravity = 10;
    liveTime = 3000;
    allCombatants: ICombatant[] = [];
    hitDistance = 5;
    damage: number;

    constructor(startPosition: Vector, direction: Vector, allCombatants: ICombatant[], faction: Faction, damage: number) {
        super({
            name: 'Bullet',
            pos: startPosition,
            width: 8,
            height: 4,
            color: Color.Yellow,
            collisionType: CollisionType.Passive,
            z: 2
        });

        this.allCombatants = allCombatants;
        this.direction = direction;
        this.faction = faction
        this.damage = damage

        this.scale = vec(0.75, 0.75)
    }

    override onPreUpdate(engine: Engine, elapsedMs: number): void {
        if (!this.direction) return

        this.vel = this.direction.scale(this.speed)
        this.vel.y += this.gravity;
        this.liveTime -= elapsedMs;

        const hitTarget = this.allCombatants.find(x =>
            x.faction !== this.faction &&
            Math.abs(x.globalPos.x - this.globalPos.x) <= this.hitDistance
        );

        if (hitTarget !== undefined) {
            hitTarget.takeDamage(this.damage, this.direction.x > 0 ? HorizontalDirection.Right : HorizontalDirection.Left)
            this.kill()
        }

        if (this.liveTime < 0) {
            this.kill()
        }
    }
}
