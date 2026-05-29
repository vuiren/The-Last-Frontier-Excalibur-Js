import { Vector, Engine } from "excalibur";
import { Direction, Lane } from "./constants";
import { Unit, UnitActivity } from "./unit";
import { UnitConfig } from "./unitConfigs";

export class EnemyUnit extends Unit {
    constructor(startPosition: Vector, config: UnitConfig, allUnits: Unit[], lane: Lane) {
        super(startPosition, config, allUnits, lane);
    }

    protected override selectActivity(): UnitActivity {
        const enemy = this.findClosestEnemy();
        const isOutOfDistanceFromDestination = this.pos.distance(this.orderedDestination) > 5;

        // Attack takes priority over everything
        if (enemy && this.isInAttackRange(enemy)) return "attacking";

        // Chase enemy if visible but not yet in range
        if (enemy) return "moving";

        // Fall back to ordered destination
        if (isOutOfDistanceFromDestination) return "moving";

        return "idle";
    }

    protected override onUpdateActivity(activity: UnitActivity): void {
        const enemy = this.findClosestEnemy();

        switch (activity) {
            case "attacking":
                this.vel = Vector.Zero;
                if (enemy) {
                    if (this.attackCooldown <= 0) {
                        this.performAttack(enemy);
                        this.attackCooldown = this.config.attackCooldown;
                    }
                }
                break;
            case "moving":
                // Chase enemy if present, otherwise head to destination
                if (enemy) {
                    this.moveTowardEnemy(enemy);
                } else {
                    this.moveTowardDestination();
                }
                break;
            case "idle":
                this.vel = Vector.Zero;
                break;
        }
    }

    override takeDamage(damage: number, hitDirection: Direction): void {
        super.takeDamage(damage, hitDirection);

        if (this.isDead) return;

        const { hitReactChance } = this.config;
        if (hitReactChance && Math.random() > hitReactChance) return;

        const knockback = hitDirection === Direction.Right
            ? this.pos.sub(new Vector(50, 0))
            : this.pos.add(new Vector(50, 0));

        this.moveTo(knockback);
    }
}