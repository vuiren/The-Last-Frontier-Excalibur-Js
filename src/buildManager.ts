import { Actor, Engine, EventEmitter, PointerButton, PointerEvent, vec, Vector } from "excalibur";
import { AnimComponent } from "./animComponent";
import { Resources } from "./resources";
import { EntitySpawner } from "./entitySpawner";
import { FrontGroundYLevel } from "./constants";

export type BuildManagerEvents = {
    barricadeSpawn: { x: number };
};

export class BuildManager {
    events = new EventEmitter<BuildManagerEvents>();
    isPlacingBuilding: boolean = false;

    private buildPreview: Actor;
    private entitySpawner: EntitySpawner;
    private animComponent: AnimComponent;
    private lastPointerPos: Vector | null = null;

    constructor(engine: Engine, entitySpawner: EntitySpawner) {
        this.entitySpawner = entitySpawner;

        this.buildPreview = this.entitySpawner.spawnBarricadeBuildPreview();
        this.buildPreview.graphics.isVisible = false;
        this.animComponent = new AnimComponent(Resources.Barricade);
        this.animComponent.play("Idle", this.buildPreview.graphics);

        engine.input.pointers.primary.on("move", this.onPointerMove.bind(this));
        engine.input.pointers.primary.on("down", (x) => this.onPointerDown(x));

    }

    startPlacingBuilding() {
        this.isPlacingBuilding = true;
        this.buildPreview.graphics.isVisible = true;
    }

    stopPlacingBuilding() {
        this.isPlacingBuilding = false;
        this.buildPreview.graphics.isVisible = false;
    }

    private onPointerMove(evt: { worldPos: Vector }): void {
        if (!this.isPlacingBuilding) return

        this.lastPointerPos = evt.worldPos;
        this.buildPreview.pos = vec(this.lastPointerPos.x, FrontGroundYLevel);
    }

    private onPointerDown(evt: PointerEvent): void {
        if (!this.isPlacingBuilding) return;

        if (evt.button === PointerButton.Left) {
            this.entitySpawner.spawnBarricadeScraps(this.buildPreview.pos.x);
            this.stopPlacingBuilding();
            this.events.emit("barricadeSpawn", { x: this.buildPreview.pos.x });
        }
    }
}