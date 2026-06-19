import { vec, Vector } from "excalibur";
import { Faction, Lane, GetYLevel, GetScaleByLane } from "../constants";
import { Resources } from "../resources";
import { Building } from "./building";

export class InfectedBuilding extends Building {
    constructor(startPosition: Vector, faction: Faction, health: number, lane: Lane) {
        startPosition = vec(startPosition.x, GetYLevel(lane));
        super({ name: 'InfectedBuilding', pos: startPosition, width: 48, height: 32, z: -2, anchor: vec(0.5, 1) }, Resources.InfectedFarmHouse, faction, health, lane);
        this.scale = GetScaleByLane(lane);
    }
}