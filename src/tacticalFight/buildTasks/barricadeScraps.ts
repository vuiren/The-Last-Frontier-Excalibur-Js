import { vec } from "excalibur";
import { Resources } from "../../resources";
import { FrontGroundYLevel, zLabels } from "../../constants";
import { EntitySpawner } from "../entitySpawner";
import { BuildTask } from "../buildTasks/buildTask";

export class BarricadeScraps extends BuildTask {
    constructor(posX: number, entitySpawner: EntitySpawner) {
        const conf = { name: 'BarricadeScraps', pos: vec(posX, FrontGroundYLevel), width: 8, height: 4, z: zLabels.Barricades, anchor: vec(0.5, 1) }
        super(conf, 5, Resources.Barricade, entitySpawner, vec(-8, -20));
    }

    override onBuilt(): void {
        this.entitySpawner.spawnBarricade(this.pos.x);
    }
}