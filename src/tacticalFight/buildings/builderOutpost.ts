import { vec } from "excalibur";
import { FrontGroundYLevel, zLabels, Faction } from "../../constants";
import { Resources } from "../../resources";
import { Building } from "./building";
import { WorkplaceComponent } from "../components/workplaceComponent";
import { EntitySpawner } from "../entitySpawner";

export class BuilderOutpost extends Building {
    foodDelta = 5

    constructor(startX: number, spawner: EntitySpawner) {
        const startPosition = vec(startX, FrontGroundYLevel);
        super({ name: 'Farm', pos: startPosition, width: 32, height: 64, z: zLabels.Buildings, anchor: vec(0.5, 1) }, Resources.BuilderOutpost, Faction.Player, 100, vec(-8, -80));
        
        this.addComponent(new WorkplaceComponent(this, spawner));
    }
}