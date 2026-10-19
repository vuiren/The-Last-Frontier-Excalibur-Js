import { Actor, Engine, vec } from "excalibur";
import { AnimComponent } from "./components/animComponent";
import { FrontGroundYLevel, zLabels } from "../constants";
import { Resources } from "../resources";
import { TreeComponent } from "./components/components";

export class Tree extends Actor {
    constructor(posX: number, woodAmount: number = 5) {
        const z = Math.random() > 0.5 ? zLabels.TreesBackground : zLabels.TreesForeground;
        const conf = { name: 'Tree', pos: vec(posX, FrontGroundYLevel), width: 32, height: 96, z: z, anchor: vec(0.5, 1) };
        super(conf);
        this.addComponent(new AnimComponent(Resources.Tree));
        this.addComponent(new TreeComponent(woodAmount));
    }

    override onInitialize(_engine: Engine): void {
        this.get(AnimComponent).play("Idle");
    }
}