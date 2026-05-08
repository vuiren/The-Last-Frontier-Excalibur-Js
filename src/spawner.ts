import { Actor, Engine, Vector } from "excalibur";
import { Resources } from "./resources";
import { Unit } from "./unit";
import { spawnEnemy } from "./spawnFunctions";

export class Spawner extends Actor {
    spawnDelay = 5000;
    remainingSpawnDelay = 0;
    allUnits: Unit[] = []
    private onUnitClick: (unit: Unit) => void;

    constructor(startPosition: Vector, allUnits: Unit[], onUnitClick: (unit: Unit) => void) {
        super({
            name: 'Spawner',
            pos: startPosition,
            width: 100,
            height: 100,
        });

        this.allUnits = allUnits;
        this.onUnitClick = onUnitClick
    }

    override onInitialize() {
        this.graphics.add(Resources.Sword.toSprite());
    }

    override onPreUpdate(engine: Engine, elapsedMs: number): void {
        this.remainingSpawnDelay -= elapsedMs;
        if (this.remainingSpawnDelay <= 0) {
            this.remainingSpawnDelay = this.spawnDelay;
            spawnEnemy(engine.currentScene, this.allUnits, this.pos, this.onUnitClick)
        }
    }

    override onPostKill() {
        this.emit('died', this)
    }
}