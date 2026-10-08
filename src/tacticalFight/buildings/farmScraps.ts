import { vec } from "excalibur";
import { Resources } from "../../resources";
import { FrontGroundYLevel } from "../../constants";
import { EntitySpawner } from "../entitySpawner";
import { BuildTask } from "./buildTask";

export class FarmScraps extends BuildTask {
    constructor(posX: number, entitySpawner: EntitySpawner) {
        const conf = { name: 'FarmScraps', pos: vec(posX, FrontGroundYLevel), width: 32, height: 32, z: 2, anchor: vec(0.5, 1) }
        super(conf, Resources.FarmHouse, entitySpawner);
    }

    override onBuilt(): void {
        this.entitySpawner.spawnFarmHouse(this.pos.x);
    }
}