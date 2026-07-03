import { vec } from "excalibur";
import { Faction, Lane, GetYLevel, GetScaleByLane } from "../constants";
import { Resources } from "../resources";
import { Building } from "./building";
import { spawnInfectedFarmHouse } from "../spawnFunctions";
import { UnitsManager } from "../unitsManager";
import { IGroupable } from "../combatant";

export class PlayerBase extends Building {
    private unitsManager: UnitsManager;
    private allGroupables: IGroupable[];

    constructor(startX: number, faction: Faction, health: number, lane: Lane, unitsManager: UnitsManager, allGroupables: IGroupable[]) {
        const startPosition = vec(startX, GetYLevel(lane));
        super({ name: 'PlayerBase', pos: startPosition, width: 48, height: 32, z: -2, anchor: vec(0.5, 1) }, Resources.PlayerBase, faction, health, lane);
        this.scale = GetScaleByLane(lane);
        this.unitsManager = unitsManager;
        this.allGroupables = allGroupables;
    }

    override onDeath(): void {
        super.onDeath();
        if (this.scene === null) return;
        spawnInfectedFarmHouse(this.scene, this.pos.x, 100, this.lane, this.unitsManager, this.allGroupables);
    }
}