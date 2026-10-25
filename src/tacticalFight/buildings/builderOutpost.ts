import { vec } from "excalibur";
import { FrontGroundYLevel, zLabels, Faction } from "../../constants";
import { Resources } from "../../resources";
import { Building } from "./building";
import { EntitySpawner } from "../entitySpawner";
import { VacantComponent, WorkplaceComponent } from "../components/components";
import { ActiveOrdersManager } from "../managers/activeOrdersManager";

export class BuilderOutpost extends Building {
    foodDelta = 5

    constructor(startX: number, spawner: EntitySpawner, activeOrders: ActiveOrdersManager) {
        const startPosition = vec(startX, FrontGroundYLevel);
        const config = { name: 'Farm', pos: startPosition, width: 32, height: 64, z: zLabels.Buildings, anchor: vec(0.5, 1) }
        super(config, activeOrders, Resources.BuilderOutpost, Faction.Player, 100, vec(-8, -80));

        this.addComponent(new WorkplaceComponent((x, pos, wp) => spawner.spawnBuilder(x, pos, wp), 1, 12, -18));
        this.addComponent(new VacantComponent())
    }
}