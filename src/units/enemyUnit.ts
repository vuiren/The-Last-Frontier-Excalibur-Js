import { Vector } from "excalibur";
import { HorizontalDirection, Lane } from "../constants";
import { Unit, UnitActivity } from "./unit";
import { UnitConfig } from "../unitConfigs";
import { ICombatant, IGroupable } from "../combatant";

export class EnemyUnit extends Unit {
    wanderTimer: number = 3000; // Time in ms to spend wandering before picking a new random destination
    currentAggression: number = 0;
    aggressionThreshold: number = 50; // Amount of aggression needed to start chasing the player
    detectedEnemy: ICombatant | null = null;

    constructor(posX: number, allUnits: ICombatant[], allGroupables: IGroupable[], config: UnitConfig, lane: Lane) {
        super(posX, config, allUnits, allGroupables, lane);
    }

    protected override selectActivity(): UnitActivity {
        if (this.isDead) return "dead";
        this.detectedEnemy = this.findBestEnemy();

        // Attack takes priority over everything
        if (this.detectedEnemy && this.isInAttackRange(this.detectedEnemy)) return "attacking";

        // Chase enemy if visible but not yet in range
        if (this.detectedEnemy) return "chasing";

        const isOutOfDistanceFromDestination = this.pos.distance(this.orderedDestination) > 5;
        // Fall back to ordered destination
        if (isOutOfDistanceFromDestination) return "moving";

        return "idle";
    }

    protected override onUpdateActivity(activity: UnitActivity): void {
        const enemy = this.detectedEnemy;

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
                this.moveTowardDestination();
                break;
            case "stunned":
                this.vel = this.lastDamageDirection === HorizontalDirection.Right
                    ? Vector.Left.scale(50)
                    : Vector.Right.scale(50);
                break;
            case "chasing":
                if (enemy) {
                    this.moveTowardEnemy(enemy);
                }
                break;
            case "idle":
                if (this.groupRef !== null && this.groupRef.leader !== this) return; // Only lead unit should pick random destination while idle
                if (this.timeInCurrentActivity > this.wanderTimer) {
                    // Pick a new random destination within a certain radius
                    const randomDirection = Math.random() <= 0.5 ? Vector.Left : Vector.Right;
                    const randomDistance = 50 + Math.random() * 50;
                    const newDestination = this.pos.add(randomDirection.scale(randomDistance));
                    this.moveTo(newDestination);
                }

                break;
        }
    }

    override onEnterActivity(activity: UnitActivity, _from: UnitActivity): void {
        switch (activity) {
            case "idle":
                this.vel = Vector.Zero;
                break;
            case "dead":
                this.vel = Vector.Zero;
                break;
        }
    }

    override takeDamage(damage: number, hitDirection: HorizontalDirection): void {
        super.takeDamage(damage, hitDirection);

        if (this.isDead) return;

        this.increaseAggression(damage);
        const { hitReactChance } = this.config;
        if (hitReactChance && Math.random() > hitReactChance) return;

        const knockback = hitDirection === HorizontalDirection.Right
            ? this.pos.sub(new Vector(50, 0))
            : this.pos.add(new Vector(50, 0));

        this.moveTo(knockback);
    }

    increaseAggression(amount: number): void {
        this.currentAggression += amount;
        if (this.currentAggression > this.aggressionThreshold) {
            //  this.moveTo()
        }
    }
}