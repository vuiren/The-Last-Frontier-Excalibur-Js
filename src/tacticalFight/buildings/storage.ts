import { Engine, vec } from "excalibur";
import { Faction, FrontGroundYLevel, zLabels } from "../../constants";
import { Resources } from "../../resources";
import { Building } from "./building";
import { EntitySpawner } from "../entitySpawner";
import { ResourcesManager } from "../managers/resourcesManager";
import { LabelComponent, WoodStorageComponent } from "../components/components";
import { ActiveOrdersManager } from "../managers/activeOrdersManager";

export class Storage extends Building {
    constructor(startX: number, private entitySpawner: EntitySpawner, private resourcesManager: ResourcesManager, activeOrders: ActiveOrdersManager) {
        const startPosition = vec(startX, FrontGroundYLevel);
        super({ name: 'Storage', pos: startPosition, width: 32, height: 32, z: zLabels.Buildings, anchor: vec(0.5, 1) }, activeOrders, Resources.Storage, Faction.Player, 100);
        this.addComponent(new WoodStorageComponent(this))
      //  this.get(WoodStorageComponent).addWood(1000)

        const wood = this.get(WoodStorageComponent)
        this.addComponent(new LabelComponent(vec(0, -46), () => wood.woodAmount.toString()))
    }

    override onPreUpdate(engine: Engine, elapsed: number): void {
        this.get(LabelComponent).refresh()
    }
}