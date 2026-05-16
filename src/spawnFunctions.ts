import { Scene, Vector } from "excalibur";
import { Spawner } from "./spawner";
import { Unit } from "./unit";
import { UnitMoveMarker } from "./unitMoveMarker";
import { UnitsManager } from "./unitsManager";
import { PlayerUnit } from "./playerUnit";

export function spawnSpawner(scene: Scene, allSpawners: Spawner[], allUnits: Unit[], pos: Vector, unitsManager: UnitsManager) {
    const spawner = new Spawner(pos, allUnits, unitsManager);
    allSpawners.push(spawner);

    spawner.on('died', (e) => {
        const dead = e as Unit;
        const index = allSpawners.findIndex(x => x.id === dead.id);
        if (index !== -1) allSpawners.splice(index, 1);
    });

    scene.add(spawner);

    return spawner;
}

export function spawnUnitMoveMarker(scene: Scene, assignedUnit: PlayerUnit, pos: Vector) {
    const unitMoveMarker = new UnitMoveMarker(pos, assignedUnit);
    scene.add(unitMoveMarker);

    return unitMoveMarker;
}
