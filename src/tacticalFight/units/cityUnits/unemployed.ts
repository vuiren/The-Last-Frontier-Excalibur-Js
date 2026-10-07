import { vec } from "excalibur"
import { FrontGroundYLevel, zLabels, Faction } from "../../../constants"
import { Resources } from "../../../resources"
import { CityUnit } from "./cityUnit"

export class UnemployedUnit extends CityUnit {
    constructor(posX: number) {
        const config = { name: 'Unit', pos: vec(posX, FrontGroundYLevel), width: 16, height: 16, anchor: vec(0.5, 1), z: zLabels.CityUnits }
        super(config, Resources.UnemployedUnit, 100, Faction.Player, 1)
    }
}