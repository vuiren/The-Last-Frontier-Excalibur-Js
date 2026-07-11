import { ICombatant } from "./combatant";
import { Building } from "./buildings/building";

export class BuildingsManager {
    private allCombatants: ICombatant[] = [];

    onBuildingAdded?: (building: ICombatant) => void;
    onBuildingRemoved?: (building: ICombatant) => void;

    constructor(allCombatants: ICombatant[]) {
        this.allCombatants = allCombatants;
    }

    registerBuilding(building: Building) {
        this.allCombatants.push(building);
        building.on('kill', () => this.removeBuilding(building));
        this.onBuildingAdded?.(building);
    }

    removeBuilding(building: ICombatant) {
        const index = this.allCombatants.indexOf(building);
        if (index !== -1) this.allCombatants.splice(index, 1);
        this.onBuildingRemoved?.(building);
    }
}