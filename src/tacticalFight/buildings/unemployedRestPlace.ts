import { vec } from "excalibur";
import { FrontGroundYLevel, zLabels, Faction } from "../../constants";
import { Resources } from "../../resources";
import { Building } from "./building";
import { UnemployedPlaceComponent, VacantComponent } from "../components/components";
import { ActiveOrdersManager } from "../managers/activeOrdersManager";

export class UnemployedRestPlace extends Building {
    constructor(startX: number, activeOrders: ActiveOrdersManager) {
        const startPosition = vec(startX, FrontGroundYLevel);
        super({ name: 'Farm', pos: startPosition, width: 32, height: 64, z: zLabels.Buildings, anchor: vec(0.5, 1) }, activeOrders, Resources.UnemployedRestPlace, Faction.Player, 100, vec(-8, -80));

        this.addComponent(new UnemployedPlaceComponent(3, 12, -18));
        this.addComponent(new VacantComponent())
    }
}