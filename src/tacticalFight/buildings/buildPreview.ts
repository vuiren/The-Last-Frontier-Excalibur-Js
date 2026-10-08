import { Actor, Color, vec, Vector } from "excalibur";
import { AnimComponent } from "../components/animComponent";
import { FrontGroundYLevel } from "../../constants";
import { Resources } from "../../resources";
import { BuildSpawns } from "../managers/buildManager";
import { AsepriteResource } from "@excaliburjs/plugin-aseprite";

const PREVIEW_RESOURCES: Record<BuildSpawns, AsepriteResource> = {
    barricadeSpawn: Resources.Barricade,
    farmSpawn: Resources.FarmHouse,
    builderOutpostSpawn: Resources.BuilderOutpost,
};

export class BuildPreview extends Actor {
    checkForCollisions: boolean = true;

    constructor() {
        super({
            width: 8,
            height: 4,
            anchor: vec(0.5, 1),
            z: 6,
            opacity: 0.5,
        })

        this.graphics.isVisible = false;
        this.addComponent(new AnimComponent(Resources.Barricade));
        this.get(AnimComponent).play("Idle");
    }

    get x(): number {
        return this.pos.x;
    }

    show() {
        this.graphics.isVisible = true;
    }

    hide() {
        this.graphics.isVisible = false;
    }

    moveTo(worldPos: Vector) {
        this.pos = vec(worldPos.x, FrontGroundYLevel);
    }
    private get anim() { return this.get(AnimComponent); }

    setTint(color: Color) { this.anim.setTint(color); }

    changeSprite(buildType: BuildSpawns) {
        this.anim.setResource(PREVIEW_RESOURCES[buildType]);
        this.anim.play("Idle");
    }
}