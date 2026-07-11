import { vec } from "excalibur";
import { Faction, FrontGroundYLevel } from "../constants";
import { Resources } from "../resources";
import { Building } from "./building";
import { EntitySpawner } from "../entitySpawner";

export class PlayerBase extends Building {
    private entitySpawner: EntitySpawner;

    constructor(startX: number, health: number, entitySpawner: EntitySpawner) {
        const startPosition = vec(startX, FrontGroundYLevel);
        super({ name: 'PlayerBase', pos: startPosition, width: 48, height: 32, z: 2, anchor: vec(0.5, 1) }, Resources.PlayerBase, Faction.Player, health);
        this.entitySpawner = entitySpawner;
    }

    override onDeath(): void {
        super.onDeath();
        if (this.scene === null) return;
        this.entitySpawner.spawnInfectedFarmHouse(this.pos.x, 100);
    }
}