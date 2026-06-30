import { vec } from "excalibur";
import { Faction, Lane, GetYLevel, GetScaleByLane } from "../constants";
import { Resources } from "../resources";
import { Building } from "./building";

export class PlayerBase extends Building {
    constructor(startX: number, faction: Faction, health: number, lane: Lane) {
        const startPosition = vec(startX, GetYLevel(lane));
        super({ name: 'PlayerBase', pos: startPosition, width: 48, height: 32, z: -2, anchor: vec(0.5, 1) }, Resources.PlayerBase, faction, health, lane);
        this.scale = GetScaleByLane(lane);
    }
}