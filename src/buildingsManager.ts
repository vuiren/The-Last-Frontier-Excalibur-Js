import { ICombatant } from "./combatant";
import { Building } from "./buildings/building";

export class BuildingsManager {
    allBuildings: ICombatant[] = [];

    onBuildingAdded?: (building: ICombatant) => void;
    onBuildingRemoved?: (building: ICombatant) => void;

    constructor(allBuildings: ICombatant[]) {
        this.allBuildings = allBuildings;
    }

    registerBuilding(building: Building) {
        this.allBuildings.push(building);
        building.on('died', () => this.removeBuilding(building));
        this.onBuildingAdded?.(building);
    }

    removeBuilding(building: ICombatant) {
        const index = this.allBuildings.indexOf(building);
        if (index !== -1) this.allBuildings.splice(index, 1);
        this.onBuildingRemoved?.(building);
    }
}