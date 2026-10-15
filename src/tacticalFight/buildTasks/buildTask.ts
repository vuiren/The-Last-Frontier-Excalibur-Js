import { Color, ActorArgs, Engine, Actor, Vector } from "excalibur";
import { ProgressBar } from "../../progressBar";
import { EntitySpawner } from "../entitySpawner";
import { AsepriteResource } from "@excaliburjs/plugin-aseprite";
import { AnimComponent } from "../components/animComponent";
import { BuildTaskComponent, VacantComponent } from "../components/components";

export class BuildTask extends Actor {
    protected buildProgress: number = 0;
    protected progressBar: ProgressBar;

    deliveredWoodAmount: number = 0;

    constructor(config: ActorArgs, requiredWoodAmount: number, graphics: AsepriteResource, protected entitySpawner: EntitySpawner, progressBarOffset: Vector) {
        config.opacity = 0.5
        super(config)

        this.progressBar = new ProgressBar(
            progressBarOffset,
            16, 4, 100, 100, Color.ExcaliburBlue
        );
        this.addChild(this.progressBar)

        this.addComponent(new AnimComponent(graphics))
        this.addComponent(new BuildTaskComponent(requiredWoodAmount))
        this.addComponent(new VacantComponent())
    }

    override onInitialize(engine: Engine): void {
        engine.currentScene.add(this.progressBar);
        this.get(AnimComponent).play("Idle");
    }

    build(buildProgressIncreaseRate: number) {
        this.buildProgress += buildProgressIncreaseRate;
        this.progressBar.setValue(this.buildProgress);

        if (this.buildProgress >= 100) {
            this.buildProgress = 100;
            this.onBuilt()
            this.kill();
        }
    }

    onBuilt(){

    }
}