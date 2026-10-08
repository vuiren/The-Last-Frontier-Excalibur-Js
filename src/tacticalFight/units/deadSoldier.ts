import { Actor, Color, Engine, vec } from "excalibur";
import { AnimComponent } from "../components/animComponent";
import { ProgressBar } from "../../progressBar";
import { Resources } from "../../resources";
import { EntitySpawner } from "../entitySpawner";
import { FrontGroundYLevel, zLabels } from "../../constants";

export class DeadSoldier extends Actor {
    private revivalProgress: number = 0;
    private entitySpawner: EntitySpawner;
    private revivalProgressIncreaseRate: number = 0.1;
    private progressBar: ProgressBar;
    private spawnedUnit = false;

    constructor(startX: number, entitySpawner: EntitySpawner) {
        super({ name: 'DeadSoldier', pos: vec(startX, FrontGroundYLevel), width: 8, height: 8, z: zLabels.DeadUnits, anchor: vec(0.5, 1) });
        this.addComponent(new AnimComponent(Resources.DeadSoldier));
        this.color = Color.fromRGB(255, 255, 255, 0.5); // Semi-transparent to indicate it's not fully built
        this.entitySpawner = entitySpawner;
        this.progressBar = new ProgressBar(vec(-4, -8), 8, 2, 0, 1000, Color.Red);
        this.addChild(this.progressBar)
    }

    override onInitialize(engine: Engine): void {
        engine.currentScene.add(this.progressBar);
        this.playAnimation("Idle");
    }

    protected playAnimation(name: string): void {
        this.get(AnimComponent).play(name);
    }

    override onPreUpdate(engine: Engine, delta: number): void {
        this.revivalProgress += this.revivalProgressIncreaseRate * delta;
        this.progressBar.setValue(this.revivalProgress);

        if (!this.spawnedUnit && this.revivalProgress >= 1000) {
            this.entitySpawner.spawnEnemyUnit(this.pos.x, "enemyZombie");
            this.kill();
            this.progressBar.kill();
            this.spawnedUnit = true;
        }
    }
}