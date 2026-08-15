import { Actor, Color, vec, Vector } from "excalibur";
import { AnimComponent } from "../../animComponent";
import { FrontGroundYLevel } from "../../constants";
import { EntitySpawner } from "../entitySpawner";
import { Resources } from "../../resources";
import { BuildSpawns } from "../managers/buildManager";

export class BuildPreview {
    private actor: Actor;
    private animComponent: AnimComponent;

    constructor(entitySpawner: EntitySpawner) {
        this.actor = entitySpawner.spawnBarricadeBuildPreview();
        this.actor.graphics.isVisible = false;
        this.animComponent = new AnimComponent(Resources.Barricade);
        this.animComponent.play("Idle", this.actor.graphics);
    }

    get x(): number {
        return this.actor.pos.x;
    }

    show() {
        this.actor.graphics.isVisible = true;
    }

    hide() {
        this.actor.graphics.isVisible = false;
    }

    moveTo(worldPos: Vector) {
        this.actor.pos = vec(worldPos.x, FrontGroundYLevel);
    }

    setTint(color: Color) {
        this.animComponent.setTint(color)
    }

    changeSprite(buildType: BuildSpawns) {
        switch (buildType) {
            case "barricadeSpawn":
                this.animComponent = new AnimComponent(Resources.Barricade)
                this.animComponent.play("Idle", this.actor.graphics);
                break;
            case "farmSpawn":
                this.animComponent = new AnimComponent(Resources.FarmHouse)
                this.animComponent.play("Idle", this.actor.graphics)
                break;
        }
    }
}