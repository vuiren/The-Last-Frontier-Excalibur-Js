import { Query, vec } from "excalibur";
import { Resources } from "../../resources";
import { Faction, FrontGroundYLevel, zLabels } from "../../constants";
import { EntitySpawner } from "../entitySpawner";
import { BuildTask } from "./buildTask";
import { GroupableComponent } from "../../components";

export class BarricadeScraps extends BuildTask {
    constructor(posX: number, groupables: Query<typeof GroupableComponent>, entitySpawner: EntitySpawner) {
        const conf = { name: 'BarricadeScraps', pos: vec(posX, FrontGroundYLevel), width: 8, height: 4, z: zLabels.Barricades, anchor: vec(0.5, 1) }
        super(conf, Resources.Barricade, groupables, entitySpawner, Faction.Player, 1, vec(-8, -35));
    }
}