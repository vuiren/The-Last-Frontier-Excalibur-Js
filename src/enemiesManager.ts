import { Unit } from "./unit";
import { UnitsManager } from "./unitsManager";

export class EnemiesManager{
    allEnemies: Unit[] = [];
    unitsManager: UnitsManager

    constructor(unitsManager: UnitsManager){
        this.unitsManager = unitsManager
    }
}