import { vec } from "excalibur";
import { Faction, FrontGroundYLevel, zLabels } from "../../constants";
import { Building } from "./building";
import { Resources } from "../../resources";
import { ActiveOrdersManager } from "../managers/activeOrdersManager";

export class Barricade extends Building {
    constructor(posX: number, health: number, activeOrders: ActiveOrdersManager) {
        const startPosition = vec(posX, FrontGroundYLevel);
        const config = { name: 'Barricade', pos: startPosition, width: 8, height: 4, z: zLabels.Barricades, anchor: vec(0.5, 1) }
        super(config, activeOrders, Resources.Barricade, Faction.Player, health);
    }
}