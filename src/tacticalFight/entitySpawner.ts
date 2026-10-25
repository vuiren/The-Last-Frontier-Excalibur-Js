import { Query, Scene, Vector } from "excalibur";
import { UnitMoveMarker } from "./unitMoveMarker";
import { PlayerUnit } from "./units/playerUnit";
import { InfectedBuilding } from "./buildings/infectedBuilding";
import { EnemyUnit } from "./units/enemyUnit";
import { PlayerBase } from "./buildings/playerBase";
import { Barricade } from "./buildings/barricade";
import { DeadSoldier } from "./units/deadSoldier";
import { Farm } from "./buildings/farm";
import { GroupsManager } from "./managers/groupsManager";
import { UnitConfigKey, UnitConfigs } from "./units/unitConfigs";
import { ResourcesManager } from "./managers/resourcesManager";
import { BuilderOutpost } from "./buildings/builderOutpost";
import { CombatantComponent, CutOrderComponent, GroupableComponent, TreeComponent, WoodStorageComponent, WorkplaceComponent } from "./components/components";
import { BuildPreview } from "./buildings/buildPreview";
import { Builder } from "./units/cityUnits/builder";
import { UnemployedUnit } from "./units/cityUnits/unemployed";
import { Storage } from "./buildings/storage";
import { BarricadeScraps } from "./buildTasks/barricadeScraps";
import { FarmScraps } from "./buildTasks/farmScraps";
import { Tree } from "./tree";
import { WoodcuttersHome } from "./buildings/woodcuttersHome";
import { Woodcutter } from "./units/cityUnits/woodcutter";
import { Log } from "./pickableItems/log";
import { UnemployedRestPlace } from "./buildings/unemployedRestPlace";
import { ActiveOrdersManager } from "./managers/activeOrdersManager";

export class EntitySpawner {
    private readonly groupables: Query<typeof GroupableComponent>;
    private readonly combatants: Query<typeof CombatantComponent>;
    private readonly woodStorages: Query<typeof WoodStorageComponent>;
    private readonly trees: Query<typeof TreeComponent | typeof CutOrderComponent>;

    constructor(
        private readonly scene: Scene,
        private readonly groupsManager: GroupsManager,
        private readonly resourcesManager: ResourcesManager,
        private readonly activeOrdersManager: ActiveOrdersManager,
     
    ) {
        this.groupables = scene.world.query([GroupableComponent]);
        this.combatants = scene.world.query([CombatantComponent]);
        this.woodStorages = scene.world.query([WoodStorageComponent]);
        this.trees = scene.world.query([TreeComponent, CutOrderComponent]);
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
        const farm = new Farm(posX, this, this.resourcesManager, this.activeOrdersManager);
        this.scene.add(farm);

        return farm;
    }

    spawnInfectedFarmHouse(posX: number) {
        const infectedBuilding = new InfectedBuilding(posX, this, this.activeOrdersManager);
        this.scene.add(infectedBuilding);

        return infectedBuilding;
    }

    spawnBarricadeScraps(posX: number) {
        const barricadeScraps = new BarricadeScraps(posX, this);
        this.scene.add(barricadeScraps);

        return barricadeScraps;
    }

    spawnFarmScraps(posX: number) {
        const farmScraps = new FarmScraps(posX, this);
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
        const playerBase = new PlayerBase(posX, 100, this, this.resourcesManager, this.activeOrdersManager);
        this.scene.add(playerBase);
        return playerBase;
    }

    spawnBarricade(posX: number): Barricade {
        const barricade = new Barricade(posX, 100, this.activeOrdersManager);
        this.scene.add(barricade);
        return barricade;
    }

    spawnUnemployedUnit(posX: number): UnemployedUnit {
        const unemployed = new UnemployedUnit(posX);
        this.scene.add(unemployed);
        return unemployed;
    }

    spawnBuilder(posX: number, workplacePos: Vector, workplace: WorkplaceComponent): Builder {
        const builder = new Builder(posX, this.woodStorages, workplace, workplacePos);
        this.scene.add(builder);
        return builder;
    }

    spawnWoodcutter(posX: number, workplacePos: Vector, workplace: WorkplaceComponent): Woodcutter {
        const woodcutter = new Woodcutter(posX, this.trees, this.woodStorages, workplace, workplacePos);
        this.scene.add(woodcutter);
        return woodcutter;
    }

    spawnBuilderOutpost(posX: number): BuilderOutpost {
        const builderOutpost = new BuilderOutpost(posX, this, this.activeOrdersManager);
        this.scene.add(builderOutpost);
        return builderOutpost;
    }

    spawnWoodcuttersHome(posX: number): WoodcuttersHome {
        const woodcuttersHome = new WoodcuttersHome(posX, this, this.activeOrdersManager);
        this.scene.add(woodcuttersHome);
        return woodcuttersHome;
    }

    spawnStorage(posX: number): Storage {
        const storage = new Storage(posX, this, this.resourcesManager, this.activeOrdersManager);
        this.scene.add(storage);
        return storage;
    }

    spawnUnemployedRestPlace(posX: number): UnemployedRestPlace {
        const restPlace = new UnemployedRestPlace(posX, this.activeOrdersManager);
        this.scene.add(restPlace);
        return restPlace;
    }

    spawnBuildPreview(): BuildPreview {
        const preview = new BuildPreview();
        this.scene.add(preview);
        return preview;
    }

    spawnTree(posX: number): Tree {
        const tree = new Tree(posX, this.activeOrdersManager);
        this.scene.add(tree);
        return tree;
    }

    spawnLog(posX: number): Log {
        const log = new Log(posX)
        this.scene.add(log)
        return log
    }
}