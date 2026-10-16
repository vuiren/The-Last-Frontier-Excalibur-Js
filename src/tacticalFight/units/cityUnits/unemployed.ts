import { Engine, vec } from "excalibur"
import { FrontGroundYLevel, zLabels, Faction, destinationReached } from "../../../constants"
import { Resources } from "../../../resources"
import { CityUnit } from "./cityUnit"
import { UnemployedUnitComponent, VacantComponent } from "../../components/components"

export class UnemployedUnit extends CityUnit {
    private readonly speed = 40; // px/sec

    constructor(posX: number) {
        const config = { name: 'UnemployedUnit', pos: vec(posX, FrontGroundYLevel), width: 16, height: 16, anchor: vec(0.5, 1), z: zLabels.CityUnits }
        super(config, Resources.UnemployedUnit, 100, Faction.Player, 1)

        this.addComponent(new UnemployedUnitComponent(this));
        this.addComponent(new VacantComponent());
    }

    override onPreUpdate(engine: Engine, elapsed: number): void {
        if (destinationReached(this.pos, this.destination)) {
            this.vel.x = 0; // arrived: stand at the workplace
            return;
        }

        const dx = this.destination.x - this.pos.x;
        this.vel.x = Math.sign(dx) * this.speed;
        this.graphics.flipHorizontal = dx < 0;
    }
}