import { Color, Engine, vec } from "excalibur";
import { Faction, FrontGroundYLevel } from "../constants";
import { Resources } from "../resources";
import { Building } from "./building";
import { ProgressBar } from "../progressBar";
import { EntitySpawner } from "../entitySpawner";

export class InfectedBuilding extends Building {
    private progressBar: ProgressBar;
    private entitySpawner: EntitySpawner;
    private spawnProgressIncreaseRate: number = 0.1;
    private spawnProgress: number = 0;
    private spawnDelay = 5000;

    constructor(xPos: number, health: number, entitySpawner: EntitySpawner) {
        const startPosition = vec(xPos, FrontGroundYLevel);
        super({ name: 'InfectedBuilding', pos: startPosition, width: 16, height: 8, z: 2, anchor: vec(0.5, 1) }, Resources.InfectedFarmHouse, Faction.Enemy, health);

        this.entitySpawner = entitySpawner;

        this.progressBar = new ProgressBar(vec(-8, -40), 16, 4, 0, this.spawnDelay, Color.Red);
        this.addChild(this.progressBar)
    }

    override onInitialize(engine: Engine): void {
        super.onInitialize(engine);
        engine.currentScene.add(this.progressBar);
    }

    override onPreUpdate(engine: Engine, delta: number): void {
        this.spawnProgress += this.spawnProgressIncreaseRate * delta;
        this.progressBar.setValue(this.spawnProgress);

        if (this.spawnProgress >= this.spawnDelay) {
            this.spawnProgress = 0;
            this.entitySpawner.spawnEnemyUnit(this.pos.x, "enemyZombie");
        }
    }
}