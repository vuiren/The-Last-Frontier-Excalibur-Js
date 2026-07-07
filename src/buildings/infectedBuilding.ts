import { Color, Engine, vec } from "excalibur";
import { Faction, Lane, GetYLevel } from "../constants";
import { Resources } from "../resources";
import { Building } from "./building";
import { ProgressBar } from "../progressBar";
import { IGroupable } from "../combatant";
import { UnitsManager } from "../unitsManager";

export class InfectedBuilding extends Building {
    allGroupables: IGroupable[];

    private unitsManager: UnitsManager;
    private progressBar: ProgressBar;
    private spawnProgressIncreaseRate: number = 0.1;
    private spawnProgress: number = 0;
    private spawnDelay = 5000;

    constructor(xPos: number, health: number, lane: Lane, unitsManager: UnitsManager, allGroupables: IGroupable[]) {
        const startPosition = vec(xPos, GetYLevel(lane));
        super({ name: 'InfectedBuilding', pos: startPosition, width: 16, height: 8, z: -2, anchor: vec(0.5, 1) }, Resources.InfectedFarmHouse, Faction.Enemy, health, lane);

        this.progressBar = new ProgressBar(startPosition.add(vec(-8, lane === Lane.Front ? -40 : -20)), 16, 4, this.spawnDelay, Color.Red);
        this.progressBar.scale = this.lane === Lane.Front ? vec(1, 1) : vec(0.75, 0.75);
        this.unitsManager = unitsManager;
        this.allGroupables = allGroupables;
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
            this.unitsManager.spawnEnemyUnit(engine.currentScene, this.pos.x, "enemyZombie", this.lane);
        }
    }
}