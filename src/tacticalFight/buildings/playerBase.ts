import { vec } from "excalibur";
import { Faction, FrontGroundYLevel, zLabels } from "../../constants";
import { Resources } from "../../resources";
import { Building } from "./building";
import { EntitySpawner } from "../entitySpawner";
import { BuyButton } from "./buyButton";
import { ResourcesManager } from "../managers/resourcesManager";
import { ActiveOrdersManager } from "../managers/activeOrdersManager";

export class PlayerBase extends Building {
    private entitySpawner: EntitySpawner;

    constructor(startX: number, health: number, entitySpawner: EntitySpawner, resourcesManager: ResourcesManager, activeOrders: ActiveOrdersManager) {
        const startPosition = vec(startX, FrontGroundYLevel);
        const conf = { name: 'PlayerBase', pos: startPosition, width: 48, height: 32, z: zLabels.Buildings, anchor: vec(0.5, 1) }
        super(conf, activeOrders, Resources.PlayerBase, Faction.Player, health, vec(-8, -45), vec(16, -35));
        this.entitySpawner = entitySpawner;

        const buyButton = new BuyButton(-20, -60, 40, 12, {
            label: "50g", icon: Resources.BuyButtonBackground, onBuy: () => {
                this.entitySpawner.spawnUnemployedUnit(startX)
            }
        }, resourcesManager)
        this.addChild(buyButton)
    }

    override onDeath(): void {
        super.onDeath();
        if (this.scene === null) return;
        this.entitySpawner.spawnInfectedFarmHouse(this.pos.x);
    }
}