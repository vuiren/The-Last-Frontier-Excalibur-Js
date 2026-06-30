import { vec } from "excalibur";
import { Faction, Lane, GetYLevel, GetScaleByLane } from "../constants";
import { Building } from "./building";
import { Resources } from "../resources";

export class Barricade extends Building {
    constructor(posX: number, faction: Faction, health: number, lane: Lane) {
        const startPosition = vec(posX, GetYLevel(lane));
        super({ name: 'Barricade', pos: startPosition, width: 16, height: 16, z: 1, anchor: vec(0.5, 1) }, Resources.Barricade, faction, health, lane);
        this.scale = GetScaleByLane(lane);
    }
}