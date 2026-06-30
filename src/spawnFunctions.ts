import { Scene, Vector } from "excalibur";
import { UnitMoveMarker } from "./unitMoveMarker";
import { UnitsManager } from "./unitsManager";
import { PlayerUnit } from "./units/playerUnit";
import { DeadSoldier } from "./deadSoldier";
import { Faction, Lane } from "./constants";
import { ChangeLaneButton } from "./ingameButtons/changeLaneButton";
import { IGroupable } from "./combatant";
import { InfectedBuilding } from "./buildings/infectedBuilding";
import { CaptureZone } from "./buildings/captureZone";

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

export function spawnChangeLaneButton(scene: Scene, pos: Vector, allGroupables: IGroupable[], lane: Lane) {
    const button = new ChangeLaneButton(pos, allGroupables, lane);
    scene.add(button);
}

export function spawnInfectedFarmHouse(scene: Scene, posX: number, faction: Faction, health: number, lane: Lane, unitsManager: UnitsManager, allGroupables: IGroupable[]) {
    const infectedBuilding = new InfectedBuilding(posX, faction, health, lane, unitsManager, allGroupables);
    scene.add(infectedBuilding);
}

export function spawnCaptureZone(scene: Scene, pos: Vector, allGroupables: IGroupable[], lane: Lane) {
    const captureZone = new CaptureZone(pos, allGroupables, lane);
    scene.add(captureZone);
}