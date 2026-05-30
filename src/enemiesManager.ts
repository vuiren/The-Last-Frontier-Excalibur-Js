import { Unit } from "./units/unit";
import { UnitsManager } from "./unitsManager";

export class EnemiesManager{
    allEnemies: Unit[] = [];
    unitsManager: UnitsManager

    constructor(unitsManager: UnitsManager){
        this.unitsManager = unitsManager
    }
}