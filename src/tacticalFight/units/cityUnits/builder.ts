import { Engine, vec } from "excalibur";
import { FrontGroundYLevel, zLabels, Faction } from "../../../constants";
import { Resources } from "../../../resources";
import { CityUnit } from "./cityUnit";
import type { WorkplaceComponent } from "../../components/workplaceComponent";

export class Builder extends CityUnit {
    workplace?: WorkplaceComponent;
    private readonly speed = 40; // px/sec

    constructor(posX: number) {
        const config = { name: 'Builder', pos: vec(posX, FrontGroundYLevel), width: 16, height: 16, anchor: vec(0.5, 1), z: zLabels.CityUnits };
        super(config, Resources.Builder, 100, Faction.Player, 1);
    }

    onPreUpdate(_engine: Engine, elapsed: number) {
        const dx = this.destination.x - this.pos.x;
        if (Math.abs(dx) < 1) {
            this.vel.x = 0; // arrived: stand at the workplace
            return;
        }
        this.vel.x = Math.sign(dx) * this.speed;
        this.graphics.flipHorizontal = dx < 0;
    }

    onPreKill() {
        this.workplace?.onWorkerLost(this);
    }
}