import { Actor, Engine, vec } from "excalibur";
import { FrontGroundYLevel, zLabels } from "../../constants";
import { PickableResourceComponent, PickableType } from "../components/components";
import { AnimComponent } from "../components/animComponent";
import { Resources } from "../../resources";

export class Log extends Actor {
    constructor(posX: number) {
        const conf = { name: 'Log', pos: vec(posX, FrontGroundYLevel), width: 32, height: 96, z: zLabels.TreesForeground, anchor: vec(0.5, 1) }
        super(conf)

        this.addComponent(new PickableResourceComponent(PickableType.Log, 10))
        this.addComponent(new AnimComponent(Resources.Log))
    }

    override onInitialize(engine: Engine): void {
        this.get(AnimComponent).play('Idle')
    }
}