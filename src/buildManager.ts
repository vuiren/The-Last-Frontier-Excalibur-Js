import { Engine, EventEmitter, PointerButton, PointerEvent, Vector } from "excalibur";
import { EntitySpawner } from "./entitySpawner";
import { BuildPreview } from "./buildings/buildPreview";

export type BuildSpawns = "barricadeSpawn" | "orderFlagSpawn";

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

    constructor(engine: Engine, private readonly entitySpawner: EntitySpawner) {
        this.buildPreview = new BuildPreview(entitySpawner);

        engine.input.pointers.primary.on("move", this.onPointerMove.bind(this));
        engine.input.pointers.primary.on("down", (evt) => this.onPointerDown(evt));
    }

    startPlacingBuilding() {
        this.isPlacingBuilding = true;
        this.buildPreview.show();
    }

    stopPlacingBuilding() {
        this.isPlacingBuilding = false;
        this.buildPreview.hide();
    }

    setBuildingType(buildingType: BuildSpawns){
        this.buildType = buildingType
        this.buildPreview.changeSprite(this.buildType)
    }

    private onPointerMove(evt: { worldPos: Vector }): void {
        if (!this.isPlacingBuilding) return;
        this.buildPreview.moveTo(evt.worldPos);
    }

    private onPointerDown(evt: PointerEvent): void {
        if (!this.isPlacingBuilding || this.onCooldown) return;

        if (evt.button === PointerButton.Left) {
            switch(this.buildType){
                case "barricadeSpawn":
                    this.entitySpawner.spawnBarricadeScraps(this.buildPreview.x);
                    break;
                case "orderFlagSpawn":
                    this.entitySpawner.spawnOrderFlag(this.buildPreview.x)
                    break;
            }
            this.events.emit(this.buildType, { x: this.buildPreview.x });
        }
    }
}