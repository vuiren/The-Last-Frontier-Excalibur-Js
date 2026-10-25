import { Actor, Engine, vec } from "excalibur";
import { AnimComponent } from "./components/animComponent";
import { FrontGroundYLevel, zLabels } from "../constants";
import { Resources } from "../resources";
import { CutOrderComponent, TreeComponent } from "./components/components";
import { IconComponent } from "./components/iconComponent";
import { ActiveOrdersManager } from "./managers/activeOrdersManager";

export class Tree extends Actor {
    constructor(posX: number, private readonly activeOrders: ActiveOrdersManager, woodAmount: number = 5) {
        const z = Math.random() > 0.5 ? zLabels.TreesBackground : zLabels.TreesForeground;
        const conf = { name: 'Tree', pos: vec(posX, FrontGroundYLevel), width: 32, height: 96, z: z, anchor: vec(0.5, 1) };
        super(conf);
        this.addComponent(new AnimComponent(Resources.Tree));
        this.addComponent(new TreeComponent(woodAmount));

        this.addComponent(new IconComponent(vec(-8, -72), Resources.CutOrderAxe, () => "Idle", { scale: vec(0.5, 0.5) }))

        this.on("pointerdown", this.onPointerDown.bind(this));

        this.pointer.useColliderShape = false;

    }

override onInitialize(_engine: Engine): void {
    this.get(AnimComponent).play("Idle");
    this.collider.update();         // and a collider refresh
}

    onPointerDown() {
        if (!this.activeOrders.cutOrderActive) return
        const icon = this.get(IconComponent)
        if (this.has(CutOrderComponent)) {
            this.removeComponent(CutOrderComponent)
            icon.hide()
        } else {
            this.addComponent(new CutOrderComponent())
            icon.show()
        }
    }
}