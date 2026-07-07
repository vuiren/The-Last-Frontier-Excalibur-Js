import { Actor, Engine, PointerButton, PointerEvent, vec, Vector } from "excalibur";
import { BuildingsManager } from "./buildingsManager";
import { GetLaneByYLevel, GetScaleByLane, GetYLevel } from "./constants";
import { AnimComponent } from "./animComponent";
import { Resources } from "./resources";
import { EntitySpawner } from "./entitySpawner";

export class BuildManager {
    isPlacingBuilding: boolean = false;
    buildPreview: Actor;
    private entitySpawner: EntitySpawner;
    private animComponent: AnimComponent;
    private engine: Engine;
    private lastPointerPos: Vector | null = null;

    constructor(engine: Engine, entitySpawner: EntitySpawner) {
        this.entitySpawner = entitySpawner;
        this.engine = engine;
        this.buildPreview = new Actor({
            width: 8,
            height: 4,
            anchor: vec(0.5, 1),
            z: 2,
            opacity: 0.5,
        });
        engine.add(this.buildPreview);

        this.animComponent = new AnimComponent(Resources.Barricade);
        this.animComponent.play("Idle", this.buildPreview.graphics);

        engine.input.pointers.primary.on("move", this.onPointerMove.bind(this));
        engine.input.pointers.primary.on("down", (x) => this.onPointerDown(x));

    }

    startPlacingBuilding() {
        this.isPlacingBuilding = true;
    }

    stopPlacingBuilding() {
        this.isPlacingBuilding = false;
    }

    private onPointerMove(evt: { worldPos: Vector }): void {
        if (!this.isPlacingBuilding) return

        this.lastPointerPos = evt.worldPos;
        this.buildPreview.pos = vec(this.lastPointerPos.x, GetYLevel(GetLaneByYLevel(this.lastPointerPos.y)));
        this.buildPreview.scale = GetScaleByLane(GetLaneByYLevel(this.lastPointerPos.y));
    }

    private onPointerDown(evt: PointerEvent): void {
        if (!this.isPlacingBuilding) return;

        if (evt.button === PointerButton.Left) {
            this.entitySpawner.spawnBarricadeScraps(this.buildPreview.pos.x, GetLaneByYLevel(this.lastPointerPos!.y));
        }
    }
}