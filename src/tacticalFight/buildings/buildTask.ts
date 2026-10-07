import { vec, Color, ActorArgs, Engine, Vector, Actor, Query } from "excalibur";
import { ProgressBar } from "../../progressBar";
import { EntitySpawner } from "../entitySpawner";
import { Faction } from "../../constants";
import { queryNearbyWithActivity } from "../proximityQuery";
import { AsepriteResource } from "@excaliburjs/plugin-aseprite";
import { AnimComponent } from "../../animComponent";
import { BuildTaskComponent, GroupableComponent } from "../../components";

export class BuildTask extends Actor {
    protected buildProgress: number = 0;
    protected buildProgressIncreaseRate: number = 0.01;
    protected progressBar: ProgressBar;

    constructor(config: ActorArgs, graphics: AsepriteResource,  private readonly groupables: Query<typeof GroupableComponent>, private entitySpawner: EntitySpawner, private faction: Faction, health: number, healthBarOffset: Vector) {
        super(config)

        this.progressBar = new ProgressBar(
            vec(-8, -30),
            16, 4, 100, 100, Color.ExcaliburBlue
        );
        this.addChild(this.progressBar)

        this.addComponent(new AnimComponent(graphics))
        this.addComponent(new BuildTaskComponent(this))
        this.color = Color.fromRGB(255, 255, 255, 0.5);
    }

    override onInitialize(engine: Engine): void {
        engine.currentScene.add(this.progressBar);
        this.get(AnimComponent).play("Idle");
    }

    override onPreUpdate(engine: Engine, elapsed: number): void {
        // Check for nearby groupables and apply buffs
        const nearbyGroupables = queryNearbyWithActivity(this.groupables, {
            origin: this.pos,
            radius: 10,
            faction: this.faction,
            activity: "idle",   // if you add activity to the filter
        });

        nearbyGroupables.forEach(groupable => {
            this.buildProgress += this.buildProgressIncreaseRate * elapsed;
        });

        this.progressBar.setValue(this.buildProgress);

        if (this.buildProgress >= 100) {
            this.buildProgress = 100;
            this.entitySpawner.spawnBarricade(this.pos.x);
            this.kill();
        }
    }
}