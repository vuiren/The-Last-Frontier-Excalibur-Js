import { Color, EventEmitter, PointerButton, PointerEvent, Query, Scene, Vector } from "excalibur";
import { EntitySpawner } from "../entitySpawner";
import { BuildPreview } from "../buildings/buildPreview";
import { BuildingComponent } from "../components/components";

export type BuildSpawns = "barricadeSpawn" | "farmSpawn" | "builderOutpostSpawn";

export type BuildManagerEvents = {
    barricadeSpawn: { x: number };
    orderFlagSpawn: { x: number };
};

export class BuildManager {
    events = new EventEmitter<BuildManagerEvents>();
    isPlacingBuilding: boolean = false;
    buildType: BuildSpawns = "barricadeSpawn";
    onCooldown = false;
    private buildPreview: BuildPreview;
    private readonly buildingsQuery: Query<typeof BuildingComponent>

    constructor(scene: Scene, private readonly entitySpawner: EntitySpawner) {
        this.buildPreview = entitySpawner.spawnBuildPreview();
        this.buildingsQuery = scene.world.query([BuildingComponent]);
        
        scene.engine.input.pointers.primary.on("move", this.onPointerMove.bind(this));
        scene.engine.input.pointers.primary.on("down", this.onPointerDown.bind(this));
    }

    startPlacingBuilding() {
        this.isPlacingBuilding = true;
        this.buildPreview.show();
    }

    stopPlacingBuilding() {
        this.isPlacingBuilding = false;
        this.buildPreview.hide();
    }

    setBuildingType(buildingType: BuildSpawns) {
        this.buildType = buildingType
        this.buildPreview.changeSprite(this.buildType)
    }

    private onPointerMove(evt: { worldPos: Vector }): void {
        if (!this.isPlacingBuilding) return;
        this.buildPreview.moveTo(evt.worldPos);
        this.collisionCheck()
    }

    private onPointerDown(evt: PointerEvent): void {
        if (!this.isPlacingBuilding || this.onCooldown) return;

        if (evt.button === PointerButton.Left) {
            switch (this.buildType) {
                case "barricadeSpawn":
                    this.entitySpawner.spawnBarricadeScraps(this.buildPreview.x);
                    break;
                case "farmSpawn":
                    this.entitySpawner.spawnFarmScraps(this.buildPreview.x)
                    break;
                case "builderOutpostSpawn":
                    this.entitySpawner.spawnBuilderOutpost(this.buildPreview.x)
                    break;
            }

            this.events.emit(this.buildType, { x: this.buildPreview.x });
        }
    }

    private collisionCheck() {
        if (!this.buildPreview.checkForCollisions) return
        let colliding = false;

        for (const b of this.buildingsQuery.entities) {
            const building = b.get(BuildingComponent).building
            const distance = Math.abs(building.globalPos.x - this.buildPreview.x);
            const minDistance = (building.width + this.buildPreview.width) / 2;

            if (distance < minDistance) {
                colliding = true;
                break;
            }
        }

        this.buildPreview.setTint(colliding ? Color.Red : Color.White);
    }
}