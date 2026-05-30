import { Actor, Engine, vec, Vector } from "excalibur";
import { AnimComponent } from "../animComponent";
import { Resources } from "../resources";

export class Bridge extends Actor {
    private animComponent: AnimComponent;


    constructor(startPosition: Vector) {
        super({ name: 'Bridge', pos: startPosition, width: 32, height: 96, z: -2, anchor: vec(0.5, 1) });
        this.animComponent = new AnimComponent(Resources.Bridge);
        this.scale = vec(2.2, 2.2);
    }

    override onInitialize(engine: Engine): void {
        this.playAnimation("Idle");
    }

    protected playAnimation(name: string): void {
        this.animComponent.play(name, this.graphics);
    }
}