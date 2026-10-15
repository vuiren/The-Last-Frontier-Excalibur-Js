import { Actor, Engine, vec } from "excalibur";
import { AnimComponent } from "./components/animComponent";
import { FrontGroundYLevel, zLabels } from "../constants";
import { Resources } from "../resources";

export class Tree extends Actor {
    constructor(posX: number, background: boolean = true) {
        const random = Math.random()
        const z = random > 0.5 ? zLabels.TreesBackground : zLabels.TreesForeground
        const conf = { name: 'Tree', pos: vec(posX, FrontGroundYLevel), width: 32, height: 96, z: z, anchor: vec(0.5, 1) }
        super(conf)
        this.addComponent(new AnimComponent(Resources.Tree))
    }

    override onInitialize(engine: Engine): void {
        this.get(AnimComponent).play("Idle");
    }
}