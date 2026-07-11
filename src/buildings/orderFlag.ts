import { Actor, Color, Engine, vec } from "excalibur";
import { FrontGroundYLevel } from "../constants";
import { AnimComponent } from "../animComponent";
import { Resources } from "../resources";

export class OrderFlag extends Actor {
    priority: number = 0;
    range: number = 100;
    private animComponent: AnimComponent;

    constructor(startPositionX: number, private allOrderFlags: OrderFlag[]) {
        super({ name: 'OrderFlag', pos: vec(startPositionX, FrontGroundYLevel), 
            width: 32, height: 48, z: 2, anchor: vec(0.5, 1) });

        this.animComponent = new AnimComponent(Resources.CaptureZoneFlag);
        this.color = Color.fromRGB(255, 255, 255, 0.5); // Semi-transparent to indicate it's not fully built
        this.allOrderFlags.push(this);
    }

    override onInitialize(engine: Engine): void {
        this.playAnimation("Captured");
    }

    protected playAnimation(name: string): void {
        this.animComponent.play(name, this.graphics);
    }
}