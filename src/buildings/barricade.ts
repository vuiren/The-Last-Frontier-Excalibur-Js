import { vec } from "excalibur";
import { Faction, Lane, GetYLevel, GetScaleByLane } from "../constants";
import { Building } from "./building";
import { Resources } from "../resources";

export class Barricade extends Building {
    constructor(posX: number, health: number, lane: Lane) {
        const startPosition = vec(posX, GetYLevel(lane));
        super({ name: 'Barricade', pos: startPosition, width: 8, height: 4, z: 1, anchor: vec(0.5, 1) }, Resources.Barricade, Faction.Player, health, lane);
        this.scale = GetScaleByLane(lane);
    }
}