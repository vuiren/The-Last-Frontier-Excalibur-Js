import { Scene, Vector } from "excalibur";
import { ICombatant } from "./combatant";
import { Building } from "./buildings/building";
import { Faction } from "./constants";

export class BuildingsManager {
    allBuildings: ICombatant[] = [];

    onBuildingAdded?: (building: ICombatant) => void;
    onBuildingRemoved?: (building: ICombatant) => void;

    spawnBuilding(scene: Scene, faction: Faction, pos: Vector): Building {
        const building = new Building(faction, 25, {pos: pos, width: 50, height: 50});
        this.allBuildings.push(building);
        building.on('died', () => this.removeBuilding(building));
        this.onBuildingAdded?.(building);
        scene.add(building);
        return building;
    }

    removeBuilding(building: ICombatant) {
        const index = this.allBuildings.indexOf(building);
        if (index !== -1) this.allBuildings.splice(index, 1);
        this.onBuildingRemoved?.(building);
    }
}