import { Actor, Engine, vec, Vector } from "excalibur";
import { Resources } from "./resources";
import { Unit } from "./unit";
import { Direction, Faction } from "./constants";

export class Bullet extends Actor {
    direction: Vector;
    faction: Faction;
    speed = 300;
    liveTime = 3000;
    allUnits: Unit[] = [];
    hitDistance = 5;
    damage: number;
    isEnemyBullet: boolean;

    constructor(startPosition: Vector, direction: Vector, isEnemyBullet: boolean, allUnits: Unit[], faction: Faction, damage: number) {
        super({
            name: 'Bullet',
            pos: startPosition,
            width: 100,
            height: 100,
        });

        this.allUnits = allUnits
        this.direction = direction
        this.isEnemyBullet = isEnemyBullet
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
        this.liveTime -= elapsedMs;

        const hitTarget = this.allUnits.find(x => {
            return x.globalPos.distance(this.globalPos) <= this.hitDistance && x.config.faction !== this.faction
        })
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
