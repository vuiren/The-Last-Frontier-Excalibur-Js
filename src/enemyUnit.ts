import { Vector, Engine } from "excalibur";
import { Direction, Lane } from "./constants";
import { Unit } from "./unit";
import { UnitConfig } from "./unitConfigs";

export class EnemyUnit extends Unit {
    constructor(startPosition: Vector, config: UnitConfig, allUnits: Unit[], lane: Lane) {
        super(startPosition, config, allUnits, lane);
    }

    /**
     * Enemy AI: attack > chase > move to destination > idle.
     * Priority is clear from top to bottom — easy to read, easy to debug.
     */
    protected override updateBehavior(elapsedMs: number): void {
        const enemy = this.findClosestEnemy();

        if (enemy && this.isInAttackRange(enemy)) {
            this.vel.setTo(0, 0);
            this.lookDirection = enemy.pos.x < this.pos.x ? Direction.Left : Direction.Right;

            if (this.attackCooldown <= 0) {
                this.performAttack(enemy);
                this.attackCooldown = this.config.attackCooldown;
            }
            return;
        }

        if (enemy) {
            this.moveTowardEnemy(enemy);
            return;
        }

        this.moveTowardDestination();
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