import { vec, Color, ActorArgs, Engine, Actor } from "excalibur";
import { ProgressBar } from "../../progressBar";
import { EntitySpawner } from "../entitySpawner";
import { Tags } from "../../constants";
import { AsepriteResource } from "@excaliburjs/plugin-aseprite";
import { AnimComponent } from "../components/animComponent";
import { BuildTaskComponent } from "../components/components";

export class BuildTask extends Actor {
    protected buildProgress: number = 0;
    protected progressBar: ProgressBar;

    constructor(config: ActorArgs, graphics: AsepriteResource, protected entitySpawner: EntitySpawner) {
        super(config)

        this.progressBar = new ProgressBar(
            vec(-8, -30),
            16, 4, 100, 100, Color.ExcaliburBlue
        );
        this.addChild(this.progressBar)

        this.addComponent(new AnimComponent(graphics))
        this.addComponent(new BuildTaskComponent(this))
        this.color = Color.fromRGB(255, 255, 255, 0.5);

        this.addTag(Tags.Vacant)
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