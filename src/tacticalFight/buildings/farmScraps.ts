import { Query, vec } from "excalibur";
import { Resources } from "../../resources";
import { Faction, FrontGroundYLevel } from "../../constants";
import { EntitySpawner } from "../entitySpawner";
import { BuildTask } from "./buildTask";
import { GroupableComponent } from "../../components";

export class FarmScraps extends BuildTask {
    constructor(posX: number, allGroupables: Query<typeof GroupableComponent>, entitySpawner: EntitySpawner) {
        const conf = { name: 'FarmScraps', pos: vec(posX, FrontGroundYLevel), width: 32, height: 32, z: 2, anchor: vec(0.5, 1) }
        super(conf, Resources.FarmHouse, allGroupables, entitySpawner, Faction.Player, 1, vec(-8, -15));
    }
}