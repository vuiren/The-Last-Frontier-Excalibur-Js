import { vec } from "excalibur";
import { Faction, Lane, GetYLevel, GetScaleByLane } from "../constants";
import { Resources } from "../resources";
import { Building } from "./building";
import { EntitySpawner } from "../entitySpawner";

export class PlayerBase extends Building {
    private entitySpawner: EntitySpawner;

    constructor(startX: number, health: number, lane: Lane, entitySpawner: EntitySpawner) {
        const startPosition = vec(startX, GetYLevel(lane));
        super({ name: 'PlayerBase', pos: startPosition, width: 48, height: 32, z: -2, anchor: vec(0.5, 1) }, Resources.PlayerBase, Faction.Player, health, lane);
        this.scale = GetScaleByLane(lane);
        this.entitySpawner = entitySpawner;
    }

    override onDeath(): void {
        super.onDeath();
        if (this.scene === null) return;
        this.entitySpawner.spawnInfectedFarmHouse(this.pos.x, 100, this.lane);
    }
}