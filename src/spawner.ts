import { Actor, Engine, Vector } from "excalibur";
import { Resources } from "./resources";
import { Unit } from "./unit";
import { UnitsManager } from "./unitsManager";
import { Lane } from "./constants";

export class Spawner extends Actor {
    spawnDelay = 5000;
    remainingSpawnDelay = 0;
    allUnits: Unit[] = []
    unitsManager: UnitsManager;

    constructor(startPosition: Vector, allUnits: Unit[], unitsManager: UnitsManager) {
        super({
            name: 'Spawner',
            pos: startPosition,
            width: 100,
            height: 100,
        });

        this.allUnits = allUnits;
        this.unitsManager = unitsManager;
    }

    override onInitialize() {
        this.graphics.add(Resources.Sword.toSprite());
    }

    override onPreUpdate(engine: Engine, elapsedMs: number): void {
        this.remainingSpawnDelay -= elapsedMs;
        if (this.remainingSpawnDelay <= 0) {
            this.remainingSpawnDelay = this.spawnDelay;
            this.unitsManager.spawnEnemyUnit(engine.currentScene, this.pos, Lane.Front)
        }
    }

    override onPostKill() {
        this.emit('died', this)
    }
}