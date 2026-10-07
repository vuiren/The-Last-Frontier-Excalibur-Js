import { Actor, CollisionType, Color, Engine, Query, vec, Vector } from "excalibur";
import { HorizontalDirection, Faction, zLabels } from "../../constants";
import { CombatantComponent } from "../../components";

export class Bullet extends Actor {
    direction: Vector;
    faction: Faction;
    speed = 300;
    gravity = 10;
    liveTime = 3000;
    hitDistance = 5;
    damage: number;

    constructor(startPosition: Vector, direction: Vector, private allCombatants: Query<typeof CombatantComponent>, faction: Faction, damage: number) {
        super({
            name: 'Bullet',
            pos: startPosition,
            width: 8,
            height: 4,
            color: Color.Yellow,
            collisionType: CollisionType.Passive,
            z: zLabels.Bullets
        });

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

        const hitTarget = this.allCombatants.entities.find(x =>
            {
                const combatant = x.get(CombatantComponent)
                if(combatant === undefined) return false;
                
                return combatant.combatant.faction !== this.faction &&
                    Math.abs(combatant.combatant.globalPos.x - this.globalPos.x) <= this.hitDistance;
            }
        );

        if (hitTarget !== undefined) {
            hitTarget.get(CombatantComponent)?.combatant.takeDamage(this.damage, this.direction.x > 0 ? HorizontalDirection.Right : HorizontalDirection.Left)
            this.kill()
        }

        if (this.liveTime < 0) {
            this.kill()
        }
    }
}
