import { Scene, Vector } from "excalibur";
import { Spawner } from "./spawner";
import { Unit } from "./unit";
import { UnitMoveMarker } from "./unitMoveMarker";
import { Lane } from "./constants";


export function spawnEnemy(scene: Scene, allUnits: Unit[], pos: Vector, onUnitClick: (unit: Unit) => void, onUnitRightClick: (unit: Unit) => void) {
    const enemy = new Unit(pos, allUnits, onUnitClick, onUnitRightClick, true, Lane.Front, 3);
    allUnits.push(enemy);

    enemy.on('died', (e) => {
        const dead = e as Unit;
        const index = allUnits.findIndex(x => x.id === dead.id);
        if (index !== -1) allUnits.splice(index, 1);
    });

    scene.add(enemy);
    return enemy;
}

export function spawnUnit(scene: Scene, allUnits: Unit[], pos: Vector, onUnitClick: (unit: Unit) => void, onUnitRightClick: (unit: Unit) => void) {
    const unit = new Unit(pos, allUnits, onUnitClick, onUnitRightClick, false, Lane.Front, 5);
    allUnits.push(unit);

    unit.on('died', (e) => {
        const dead = e as Unit;
        const index = allUnits.findIndex(x => x.id === dead.id);
        if (index !== -1) allUnits.splice(index, 1);
    });

    scene.add(unit);

    return unit;
}

export function spawnSpawner(scene: Scene, allSpawners: Spawner[], allUnits: Unit[], pos: Vector, onUnitClick: (unit: Unit) => void) {
    const spawner = new Spawner(pos, allUnits, onUnitClick);
    allSpawners.push(spawner);

    spawner.on('died', (e) => {
        const dead = e as Unit;
        const index = allSpawners.findIndex(x => x.id === dead.id);
        if (index !== -1) allSpawners.splice(index, 1);
    });

    scene.add(spawner);

    return spawner;
}

export function spawnUnitMoveMarker(scene: Scene, assignedUnit: Unit, pos: Vector) {
    const unitMoveMarker = new UnitMoveMarker(pos, assignedUnit);
    scene.add(unitMoveMarker);

    return unitMoveMarker;
}
