import { Actor, Color, Engine, vec } from "excalibur";
import { AnimComponent } from "../animComponent";
import { Resources } from "../resources";
import { IGroupable } from "../combatant";
import { Faction, GetScaleByLane, GetYLevel, Lane } from "../constants";
import { ProgressBar } from "../progressBar";
import { queryNearby } from "../proximityQuery";
import { EntitySpawner } from "../entitySpawner";

export class BarricadeScraps extends Actor {
    allGroupables: IGroupable[] = [];
    buildProgress: number = 0;
    entitySpawner: EntitySpawner;

    buildProgressIncreaseRate: number = 0.01;

    private animComponent: AnimComponent;
    private progressBar: ProgressBar;
    private lane: Lane; // Default lane, you can modify this as needed

    constructor(posX: number, allGroupables: IGroupable[], entitySpawner: EntitySpawner, lane: Lane) {
        super({ name: 'BarricadeScraps', pos: vec(posX, GetYLevel(lane)), width: 8, height: 4, z: 2, anchor: vec(0.5, 1) });
        this.animComponent = new AnimComponent(Resources.Barricade);
        this.scale = GetScaleByLane(lane);
        this.color = Color.fromRGB(255, 255, 255, 0.5); // Semi-transparent to indicate it's not fully built
        this.lane = lane;
        this.entitySpawner = entitySpawner;
        this.allGroupables = allGroupables;
        this.progressBar = new ProgressBar(vec(posX - 16, GetYLevel(lane) - 50), 32, 6, 100, Color.Red);
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
            radius: 10,
            lane: this.lane,
            faction: Faction.Player,
            activity: "idle",   // if you add activity to the filter
        });

        nearbyGroupables.forEach(groupable => {
            this.buildProgress += this.buildProgressIncreaseRate * delta;
        });

        this.progressBar.setValue(this.buildProgress);
        this.scale = vec(1 + 1 * (this.buildProgress / 100), 1 + 1 * (this.buildProgress / 100)); // Scale up as it builds

        if (this.buildProgress >= 100) {
            this.buildProgress = 100;
            this.entitySpawner.spawnBarricade(this.pos.x, this.lane);
            this.kill();
            this.progressBar.kill();
        }
    }
}