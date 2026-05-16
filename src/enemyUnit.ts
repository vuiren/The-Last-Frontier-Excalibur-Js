import { Vector, Engine } from "excalibur";
import { Faction, Lane } from "./constants";
import { Unit } from "./unit";

export class EnemyUnit extends Unit {
    patrolPoints: Vector[] = [];
    currentPatrolIndex = 0;
    aggroRange = 400;

    constructor(startPosition: Vector, allUnits: Unit[], lane: Lane, health: number) {
        // enemies don't need click handlers, so pass no-ops
        super(startPosition, allUnits, Faction.Enemy, lane, health);
    }

    override onPreUpdate(engine: Engine, elapsedMs: number): void {
        this.handleAI();
        super.onPreUpdate(engine, elapsedMs); // still runs movement, shooting, etc.
    }

    private handleAI(): void {
        if (this.nearby.length > 0) {
            // already handled by base class shooting logic
            return;
        }
        this.patrol();
    }

    private patrol(): void {
        if (this.patrolPoints.length === 0) return;
        const target = this.patrolPoints[this.currentPatrolIndex];
        if (this.pos.distance(target) < 10) {
            this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
        }
        this.moveTo(target, false);
    }
}