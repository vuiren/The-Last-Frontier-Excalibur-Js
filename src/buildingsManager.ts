import { Scene, Vector } from "excalibur";
import { ICombatant } from "./combatant";
import { Faction, Lane } from "./constants";
import { PlayerBase } from "./buildings/playerBase";

export class BuildingsManager {
    allBuildings: ICombatant[] = [];

    onBuildingAdded?: (building: ICombatant) => void;
    onBuildingRemoved?: (building: ICombatant) => void;

    constructor(allBuildings: ICombatant[]) {
        this.allBuildings = allBuildings;
    }

    spawnPlayerBase(scene: Scene, pos: Vector, faction: Faction, lane: Lane): PlayerBase {
        const playerBase = new PlayerBase(pos, faction, 100, lane);
        this.allBuildings.push(playerBase);
        playerBase.on('died', () => this.removeBuilding(playerBase));
        this.onBuildingAdded?.(playerBase);
        scene.add(playerBase);
        return playerBase;
    }

    removeBuilding(building: ICombatant) {
        const index = this.allBuildings.indexOf(building);
        if (index !== -1) this.allBuildings.splice(index, 1);
        this.onBuildingRemoved?.(building);
    }
}