import { vec } from "excalibur";
import { Faction, FrontGroundYLevel } from "../constants";
import { Resources } from "../resources";
import { Building } from "./building";
import { EntitySpawner } from "../entitySpawner";

export class Farm extends Building {
    private entitySpawner: EntitySpawner;

    constructor(startX: number, entitySpawner: EntitySpawner) {
        const startPosition = vec(startX, FrontGroundYLevel);
        super({ name: 'Farm', pos: startPosition, width: 32, height: 32, z: 2, anchor: vec(0.5, 1) }, Resources.FarmHouse, Faction.Player, 100);
        this.entitySpawner = entitySpawner;

        this.enableBuyButton({
            label: "hi",
            onBuy: () => { console.log("Test") },
            offset: vec(-4, -60)
        })
    }

    override onDeath(): void {
        super.onDeath();
        if (this.scene === null) return;
        this.entitySpawner.spawnInfectedFarmHouse(this.pos.x);
    }
}