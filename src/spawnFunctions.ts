import { Scene, Vector } from "excalibur";
import { Spawner } from "./spawner";
import { UnitMoveMarker } from "./unitMoveMarker";
import { UnitsManager } from "./unitsManager";
import { PlayerUnit } from "./units/playerUnit";
import { Unit } from "./units/unit";
import { DeadSoldier } from "./deadSoldier";
import { Lane } from "./constants";
import { ChangeLaneButton } from "./ingameButtons/changeLaneButton";
import { ICombatant } from "./combatant";

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

export function spawnDeadSoldier(scene: Scene, pos: Vector, unitsManager: UnitsManager, lane: Lane) {
    const deadSoldier = new DeadSoldier(pos, unitsManager, lane);
    scene.add(deadSoldier);

    return deadSoldier;
}

export function spawnChangeLaneButton(scene: Scene, pos: Vector, allCombatants: ICombatant[], lane: Lane) {
    const button = new ChangeLaneButton(pos, allCombatants, lane);
    scene.add(button);
}