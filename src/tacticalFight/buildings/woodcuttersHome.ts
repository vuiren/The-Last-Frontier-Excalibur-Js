import { vec } from "excalibur";
import { FrontGroundYLevel, zLabels, Faction } from "../../constants";
import { Resources } from "../../resources";
import { Building } from "./building";
import { EntitySpawner } from "../entitySpawner";
import { WorkplaceComponent } from "../components/components";

export class WoodcuttersHome extends Building {
    constructor(startX: number, spawner: EntitySpawner) {
        const startPosition = vec(startX, FrontGroundYLevel);
        super({ name: 'WoodcuttersHome', pos: startPosition, width: 64, height: 64, z: zLabels.Buildings, anchor: vec(0.5, 1) }, Resources.WoodcuttersHome, Faction.Player, 100, vec(-8, -80));

        this.addComponent(new WorkplaceComponent((x, pos, wp) => spawner.spawnWoodcutter(x, pos, wp), 1, 12));
    }
}