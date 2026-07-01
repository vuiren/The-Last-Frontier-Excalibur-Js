import { Color, Engine, vec } from "excalibur";
import { Faction, Lane, GetYLevel } from "../constants";
import { Resources } from "../resources";
import { Building } from "./building";
import { ProgressBar } from "../progressBar";
import { IGroupable } from "../combatant";
import { UnitsManager } from "../unitsManager";

export class InfectedBuilding extends Building {
    spawnDelay = 500000;
    remainingSpawnDelay = 0;
    allGroupables: IGroupable[];

    private unitsManager: UnitsManager;
    private progressBar: ProgressBar;
    private spawnProgressIncreaseRate: number = 0.1;
    private spawnProgress: number = 0;

    constructor(xPos: number, faction: Faction, health: number, lane: Lane, unitsManager: UnitsManager, allGroupables: IGroupable[]) {
        const startPosition = vec(xPos, GetYLevel(lane));
        super({ name: 'InfectedBuilding', pos: startPosition, width: 48, height: 32, z: -2, anchor: vec(0.5, 1) }, Resources.InfectedFarmHouse, faction, health, lane);
        
        this.progressBar = new ProgressBar(startPosition.add(vec(-16, -80)), 32, 6, 100, Color.Red);
        this.unitsManager = unitsManager;
        this.allGroupables = allGroupables;
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