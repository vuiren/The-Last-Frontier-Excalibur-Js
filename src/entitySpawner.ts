import { Actor, Scene, vec, Vector } from "excalibur";
import { UnitMoveMarker } from "./unitMoveMarker";
import { UnitsManager } from "./unitsManager";
import { PlayerUnit } from "./units/playerUnit";
import { ICombatant, IGroupable } from "./combatant";
import { InfectedBuilding } from "./buildings/infectedBuilding";
import { CaptureZone } from "./buildings/captureZone";
import { BarricadeScraps } from "./buildings/barricadeScraps";
import { UnitConfigKey, UnitConfigs } from "./unitConfigs";
import { EnemyUnit } from "./units/enemyUnit";
import { PlayerBase } from "./buildings/playerBase";
import { Barricade } from "./buildings/barricade";
import { DeadSoldier } from "./units/deadSoldier";
import { OrderFlag } from "./buildings/orderFlag";
import { Building } from "./buildings/building";

export class EntitySpawner {
    constructor(
        private readonly scene: Scene,
        private readonly unitsManager: UnitsManager,
        private readonly allGroupables: IGroupable[],
        private readonly allCombatants: ICombatant[],
        private readonly allOrderFlags: OrderFlag[],
    ) { }

    spawnUnitMoveMarker(assignedUnit: PlayerUnit, pos: Vector) {
        const unitMoveMarker = new UnitMoveMarker(pos, assignedUnit);
        this.scene.add(unitMoveMarker);

        return unitMoveMarker;
    }

    spawnDeadSoldier(posX: number) {
        const deadSoldier = new DeadSoldier(posX, this);
        this.scene.add(deadSoldier);

        return deadSoldier;
    }

    spawnInfectedFarmHouse(posX: number, health: number) {
        const infectedBuilding = new InfectedBuilding(posX, health, this);
        this.scene.add(infectedBuilding);

        return infectedBuilding;
    }

    spawnCaptureZone(posX: number) {
        const captureZone = new CaptureZone(posX, this.allGroupables);
        this.scene.add(captureZone);

        return captureZone;
    }

    spawnBarricadeScraps(posX: number) {
        const barricadeScraps = new BarricadeScraps(posX, this.allGroupables, this);
        this.scene.add(barricadeScraps);

        this.registerBuilding(barricadeScraps)

        return barricadeScraps;
    }

    spawnPlayerUnit(posX: number, configKey: UnitConfigKey) {
        const config = UnitConfigs[configKey];
        const unit = new PlayerUnit(posX, this.allCombatants, this.allGroupables, config, this.unitsManager, this);

        return this.unitsManager.registerUnit(this.scene, unit);
    }

    spawnEnemyUnit(posX: number, configKey: UnitConfigKey) {
        const config = UnitConfigs[configKey];
        const unit = new EnemyUnit(posX, this.allCombatants, this.allGroupables, config);

        return this.unitsManager.registerUnit(this.scene, unit);
    }

    spawnPlayerBase(posX: number): PlayerBase {
        const playerBase = new PlayerBase(posX, 100, this);
        this.registerBuilding(playerBase);
        this.scene.add(playerBase);
        return playerBase;
    }

    spawnBarricade(posX: number): Barricade {
        const barricade = new Barricade(posX, 100);
        this.registerBuilding(barricade);
        this.scene.add(barricade);
        return barricade;
    }

    spawnBarricadeBuildPreview(): Actor {
        const buildPreview = new Actor({
            width: 8,
            height: 4,
            anchor: vec(0.5, 1),
            z: 2,
            opacity: 0.5,
        });

        this.scene.add(buildPreview);

        return buildPreview
    }

    spawnOrderFlag(posX: number): Actor {
        const orderFlag = new OrderFlag(posX, this.allOrderFlags);
        this.scene.add(orderFlag);

        this.allOrderFlags.push(orderFlag)

        orderFlag.on("kill", () => {
            const index = this.allOrderFlags.indexOf(orderFlag);
            if (index !== -1) this.allCombatants.splice(index, 1);
        })

        return orderFlag
    }


    private registerBuilding(building: Building) {
        this.allCombatants.push(building);
        building.on('kill', () => this.removeBuilding(building));
    }

    private removeBuilding(building: ICombatant) {
        const index = this.allCombatants.indexOf(building);
        if (index !== -1) this.allCombatants.splice(index, 1);
    }
}