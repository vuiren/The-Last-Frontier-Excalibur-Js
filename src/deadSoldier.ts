import { Actor, Color, Engine, vec, Vector } from "excalibur";
import { GetScaleByLane, Lane } from "./constants";
import { ProgressBar } from "./progressBar";
import { AnimComponent } from "./animComponent";
import { UnitsManager } from "./unitsManager";
import { Resources } from "./resources";

export class DeadSoldier extends Actor {
    revivalProgress: number = 0;
    unitsManager: UnitsManager;

    revivalProgressIncreaseRate: number = 0.1;

    private animComponent: AnimComponent;
    private progressBar: ProgressBar;
    private lane: Lane;
    private spawnedUnit = false;

    constructor(startPosition: Vector,  unitsManager: UnitsManager, lane: Lane) {
        super({ name: 'DeadSoldier', pos: startPosition, width: 8, height: 8, z: 2, anchor: vec(0.5, 1) });
        this.animComponent = new AnimComponent(Resources.DeadSoldier);
        this.scale = GetScaleByLane(lane);
        this.color = Color.fromRGB(255, 255, 255, 0.5); // Semi-transparent to indicate it's not fully built
        this.lane = lane;
        this.unitsManager = unitsManager;
        this.progressBar = new ProgressBar(startPosition.add(vec(-16, -50)), 32, 6, 1000, Color.Red);
    }

    override onInitialize(engine: Engine): void {
        engine.currentScene.add(this.progressBar);
        this.playAnimation("Idle");
    }

    protected playAnimation(name: string): void {
        this.animComponent.play(name, this.graphics);
    }

    override onPreUpdate(engine: Engine, delta: number): void {
        this.revivalProgress += this.revivalProgressIncreaseRate * delta;
        this.progressBar.setValue(this.revivalProgress);

        if (!this.spawnedUnit && this.revivalProgress >= 1000) {
            this.unitsManager.spawnEnemyUnit(engine.currentScene, this.pos.x, "enemyZombie", this.lane);
            this.kill();
            this.progressBar.kill();
            this.spawnedUnit = true;
        }
    }
}