import { vec } from "excalibur";
import { Faction, FrontGroundYLevel, zLabels } from "../../constants";
import { Resources } from "../../resources";
import { Building } from "./building";
import { EntitySpawner } from "../entitySpawner";
import { ResourcesManager } from "../managers/resourcesManager";

export class Farm extends Building {
    foodDelta = 5

    constructor(startX: number, private entitySpawner: EntitySpawner, private resourcesManager: ResourcesManager) {
        const startPosition = vec(startX, FrontGroundYLevel);
        super({ name: 'Farm', pos: startPosition, width: 32, height: 32, z: zLabels.Buildings, anchor: vec(0.5, 1) }, Resources.FarmHouse, Faction.Player, 100);
        resourcesManager.availableFood += this.foodDelta
    }

    override onDeath(): void {
        super.onDeath();
        if (this.scene === null) return;
        this.entitySpawner.spawnInfectedFarmHouse(this.pos.x);
        this.resourcesManager.availableFood -= this.foodDelta
    }
}