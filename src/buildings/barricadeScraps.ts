import { Actor, Color, Engine, vec, Vector } from "excalibur";
import { AnimComponent } from "../animComponent";
import { Resources } from "../resources";
import { IGroupable } from "../combatant";
import { Faction, Lane } from "../constants";
import { ProgressBar } from "../progressBar";
import { BuildingsManager } from "../buildingsManager";
import { queryNearby } from "../proximityQuery";

export class BarricadeScraps extends Actor {
    allGroupables: IGroupable[] = [];
    buildProgress: number = 0;
    buildingsManager: BuildingsManager;

    buildProgressIncreaseRate: number = 0.1; // Adjust this value to control how fast the barricade scraps build up

    private animComponent: AnimComponent;
    private progressBar: ProgressBar;
    private lane: Lane; // Default lane, you can modify this as needed

    constructor(startPosition: Vector, allGroupables: IGroupable[], buildingsManager: BuildingsManager, lane: Lane) {
        super({ name: 'BarricadeScraps', pos: startPosition, width: 32, height: 32, z: 2, anchor: vec(0.5, 1) });
        this.animComponent = new AnimComponent(Resources.Barricade);
        this.scale = vec(2, 2);
        this.color = Color.fromRGB(255, 255, 255, 0.5); // Semi-transparent to indicate it's not fully built
        this.lane = lane;
        this.buildingsManager = buildingsManager
        this.allGroupables = allGroupables;
        this.progressBar = new ProgressBar(startPosition.add(vec(-16, -50)), 32, 6, 100, Color.Red);
    }

    override onInitialize(engine: Engine): void {
        engine.currentScene.add(this.progressBar);
        this.playAnimation("Idle");
    }

    protected playAnimation(name: string): void {
        this.animComponent.play(name, this.graphics);
    }

    override onPreUpdate(engine: Engine, delta: number): void {
        // Check for nearby groupables and apply buffs
        const nearbyGroupables = queryNearby(this.allGroupables, {
            origin: this.pos,
            radius: 50,
            lane: this.lane,
            faction: Faction.Player,
            activity: "idle",   // if you add activity to the filter
        });

        nearbyGroupables.forEach(groupable => {
            this.buildProgress += this.buildProgressIncreaseRate * delta;
        });

        this.progressBar.setValue(this.buildProgress);
        this.scale = vec(2 + 2 * (this.buildProgress / 100), 2 + 2 * (this.buildProgress / 100)); // Scale up as it builds

        if (this.buildProgress >= 100) {
            this.buildProgress = 100;
            this.buildingsManager.spawnBarricade(engine.currentScene, this.pos.x, Faction.Player, this.lane);
            this.kill();
            this.progressBar.kill();
        }
    }
}