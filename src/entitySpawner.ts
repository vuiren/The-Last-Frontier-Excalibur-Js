import { Scene, Vector } from "excalibur";
import { UnitMoveMarker } from "./unitMoveMarker";
import { UnitsManager } from "./unitsManager";
import { PlayerUnit } from "./units/playerUnit";
import { DeadSoldier } from "./deadSoldier";
import { Lane } from "./constants";
import { ChangeLaneButton } from "./ingameButtons/changeLaneButton";
import { ICombatant, IGroupable } from "./combatant";
import { InfectedBuilding } from "./buildings/infectedBuilding";
import { CaptureZone } from "./buildings/captureZone";
import { BarricadeScraps } from "./buildings/barricadeScraps";
import { BuildingsManager } from "./buildingsManager";
import { UnitConfigKey, UnitConfigs } from "./unitConfigs";
import { EnemyUnit } from "./units/enemyUnit";
import { PlayerBase } from "./buildings/playerBase";
import { Barricade } from "./buildings/barricade";

export class EntitySpawner {
    constructor(
        private readonly scene: Scene,
        private readonly unitsManager: UnitsManager,
        private readonly allGroupables: IGroupable[],
        private readonly allCombatants: ICombatant[],
        private readonly buildingsManager: BuildingsManager,
    ) { }

    spawnUnitMoveMarker(assignedUnit: PlayerUnit, pos: Vector) {
        const unitMoveMarker = new UnitMoveMarker(pos, assignedUnit);
        this.scene.add(unitMoveMarker);

        return unitMoveMarker;
    }

    spawnDeadSoldier(pos: Vector, lane: Lane) {
        const deadSoldier = new DeadSoldier(pos, this.unitsManager, lane);
        this.scene.add(deadSoldier);

        return deadSoldier;
    }

    spawnChangeLaneButton(pos: Vector, lane: Lane) {
        const button = new ChangeLaneButton(pos, this.allGroupables, lane);
        this.scene.add(button);

        return button;
    }

    spawnInfectedFarmHouse(posX: number, health: number, lane: Lane) {
        const infectedBuilding = new InfectedBuilding(posX, health, lane, this.unitsManager, this.allGroupables);
        this.scene.add(infectedBuilding);

        return infectedBuilding;
    }

    spawnCaptureZone(pos: Vector, lane: Lane) {
        const captureZone = new CaptureZone(pos, this.allGroupables, lane);
        this.scene.add(captureZone);

        return captureZone;
    }

    spawnBarricadeScraps(posX: number, lane: Lane) {
        const barricadeScraps = new BarricadeScraps(posX, this.allGroupables, this.buildingsManager, lane);
        this.scene.add(barricadeScraps);

        return barricadeScraps;
    }

    spawnPlayerUnit(posX: number, configKey: UnitConfigKey, startLane: Lane) {
        const config = UnitConfigs[configKey];
        const unit = new PlayerUnit(posX, this.allCombatants, this.allGroupables, config, this.unitsManager, this, startLane);
        unit.config.speed = config.speed;
        unit.config.detectionRange = config.detectionRange;
        unit.config.attackCooldown = config.attackCooldown;

        return this.unitsManager.registerUnit(this.scene, unit);
    }

    spawnEnemyUnit(posX: number, configKey: UnitConfigKey, startLane: Lane) {
        const config = UnitConfigs[configKey];
        const unit = new EnemyUnit(posX, this.allCombatants, this.allGroupables, config, startLane);

        unit.config.speed = config.speed;
        unit.config.detectionRange = config.detectionRange;
        unit.config.attackCooldown = config.attackCooldown;

        return this.unitsManager.registerUnit(this.scene, unit);
    }

    spawnPlayerBase(posX: number, lane: Lane): PlayerBase {
        const playerBase = new PlayerBase(posX, 100, lane, this);
        this.buildingsManager.registerBuilding(playerBase);
        this.scene.add(playerBase);
        return playerBase;
    }

    spawnBarricade(posX: number, lane: Lane): Barricade {
        const barricade = new Barricade(posX, 100, lane);
        this.buildingsManager.registerBuilding(barricade);
        this.scene.add(barricade);
        return barricade;
    }
}