import { Color, Engine, vec } from "excalibur";
import { Resources } from "../resources";
import { IGroupable } from "../combatant";
import { Faction, GetYLevel, Lane } from "../constants";
import { ProgressBar } from "../progressBar";
import { queryNearby } from "../proximityQuery";
import { EntitySpawner } from "../entitySpawner";
import { Building } from "./building";

export class BarricadeScraps extends Building {
    private allGroupables: IGroupable[] = [];
    private buildProgress: number = 0;
    private entitySpawner: EntitySpawner;
    private buildProgressIncreaseRate: number = 0.01;
    private progressBar: ProgressBar;

    constructor(posX: number, allGroupables: IGroupable[], entitySpawner: EntitySpawner, lane: Lane) {
        super({ name: 'BarricadeScraps', pos: vec(posX, GetYLevel(lane)), width: 8, height: 4, z: 2, anchor: vec(0.5, 1) },
            Resources.Barricade, Faction.Player, 1, lane);
        this.color = Color.fromRGB(255, 255, 255, 0.5); // Semi-transparent to indicate it's not fully built
        this.entitySpawner = entitySpawner;
        this.allGroupables = allGroupables;

        this.progressBar = new ProgressBar(
            vec(-8, lane === Lane.Front ? -40 : -35),
            16, 4, 100, 100, Color.ExcaliburBlue
        );

        this.addChild(this.progressBar)
    }

    override onInitialize(engine: Engine): void {
        engine.currentScene.add(this.progressBar);
        this.playAnimation("Idle");
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

        if (this.buildProgress >= 100) {
            this.buildProgress = 100;
            this.entitySpawner.spawnBarricade(this.pos.x, this.lane);
            this.kill();
        }
    }
}