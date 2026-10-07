import { Actor, Query, Scene, vec, Vector } from "excalibur";
import { UnitMoveMarker } from "./unitMoveMarker";
import { PlayerUnit } from "./units/playerUnit";
import { InfectedBuilding } from "./buildings/infectedBuilding";
import { BarricadeScraps } from "./buildings/barricadeScraps";
import { EnemyUnit } from "./units/enemyUnit";
import { PlayerBase } from "./buildings/playerBase";
import { Barricade } from "./buildings/barricade";
import { DeadSoldier } from "./units/deadSoldier";
import { Farm } from "./buildings/farm";
import { FarmScraps } from "./buildings/farmScraps";
import { GroupsManager } from "./managers/groupsManager";
import { UnitConfigKey, UnitConfigs } from "./units/unitConfigs";
import { ResourcesManager } from "./managers/resourcesManager";
import { BuilderOutpost } from "./buildings/builderOutpost";
import { CombatantComponent, GroupableComponent } from "../components";
import { BuildPreview } from "./buildings/buildPreview";

export class EntitySpawner {
    private readonly groupables: Query<typeof GroupableComponent>;
    private readonly combatants: Query<typeof CombatantComponent>;

    constructor(
        private readonly scene: Scene,
        private readonly groupsManager: GroupsManager,
        private readonly resourcesManager: ResourcesManager,
    ) {
        this.groupables = scene.world.query([GroupableComponent]);
        this.combatants = scene.world.query([CombatantComponent]);
    }

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

    spawnFarmHouse(posX: number) {
        const farm = new Farm(posX, this, this.resourcesManager);
        this.scene.add(farm);

        return farm;
    }

    spawnInfectedFarmHouse(posX: number) {
        const infectedBuilding = new InfectedBuilding(posX, this);
        this.scene.add(infectedBuilding);

        return infectedBuilding;
    }

    spawnBarricadeScraps(posX: number) {
        const barricadeScraps = new BarricadeScraps(posX, this.groupables, this);
        this.scene.add(barricadeScraps);

        return barricadeScraps;
    }

    spawnFarmScraps(posX: number) {
        const farmScraps = new FarmScraps(posX, this.groupables, this);
        this.scene.add(farmScraps);

        return farmScraps;
    }

    spawnPlayerUnit(posX: number, configKey: UnitConfigKey) {
        const config = UnitConfigs[configKey];
        const unit = new PlayerUnit(posX, this.combatants, config, this.groupsManager, this, this.resourcesManager);
        this.scene.add(unit);

        return unit;
    }

    spawnEnemyUnit(posX: number, configKey: UnitConfigKey) {
        const config = UnitConfigs[configKey];
        const unit = new EnemyUnit(posX, this.combatants, config);
        this.scene.add(unit);

        return unit;
    }

    spawnPlayerBase(posX: number): PlayerBase {
        const playerBase = new PlayerBase(posX, 100, this, this.resourcesManager);
        this.scene.add(playerBase);
        return playerBase;
    }

    spawnBarricade(posX: number): Barricade {
        const barricade = new Barricade(posX, 100);
        this.scene.add(barricade);
        return barricade;
    }

    spawnBuilderOutpost(posX: number): Actor {
        const builderOutpost = new BuilderOutpost(posX);
        this.scene.add(builderOutpost);
        return builderOutpost;
    }

    spawnBuildPreview(): BuildPreview {
        const preview = new BuildPreview();
        this.scene.add(preview);
        return preview;
    }
}