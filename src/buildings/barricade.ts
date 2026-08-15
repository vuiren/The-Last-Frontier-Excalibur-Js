import { vec } from "excalibur";
import { Faction, FrontGroundYLevel } from "../constants";
import { Building } from "./building";
import { Resources } from "../resources";

export class Barricade extends Building {
    constructor(posX: number, health: number) {
        const startPosition = vec(posX, FrontGroundYLevel);
        super({ name: 'Barricade', pos: startPosition, width: 8, height: 4, z: 6, anchor: vec(0.5, 1) }, Resources.Barricade, Faction.Player, health);
    }
}