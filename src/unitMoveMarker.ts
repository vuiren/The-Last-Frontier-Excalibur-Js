import {
    Actor, Engine, Vector, PointerEvent,
    vec, PointerButton, Color
} from "excalibur";
import { Resources } from "./resources";
import { BackGroundYLevel, FrontGroundYLevel, Lane } from "./constants";
import { AnimComponent } from "./animComponent";
import { PlayerUnit } from "./units/playerUnit";
import { Unit } from "./units/unit";

const SCALE_BY_LANE: Record<Lane, Vector> = {
    [Lane.Back]: vec(3, 3),
    [Lane.Front]: vec(5, 5),
};

const HOVER_LIFT_OFFSET = vec(0, -10);

export class UnitMoveMarker extends Actor {
    allUnits: Unit[] = [];
    assignedUnit: PlayerUnit;
    isDragging = false;
    isHidden = false;

    private dragOffset = Vector.Zero;
    private animComponent = new AnimComponent(Resources.FlagMarker);

    constructor(startPosition: Vector, assignedUnit: PlayerUnit) {
        super({
            name: "Unit",
            pos: startPosition,
            width: 9,
            height: 24,
            z: -1,
            anchor: vec(0.5, 1),
        });

        this.assignedUnit = assignedUnit;
        this.scale = SCALE_BY_LANE[assignedUnit.lane] ?? vec(5, 5);

        assignedUnit.on("beganAttacking", () => {
            this.pos = assignedUnit.pos;
        });

        assignedUnit.on("died", () => this.kill());
    }

    override onInitialize(engine: Engine): void {
        this.animComponent.play("Idle", this.graphics);
        this.registerPointerEvents(engine);
    }

    setTint(color: Color): void {
        this.animComponent.setTint(color);
    }

    clearTint(): void {
        this.animComponent.setTint(Color.White);
    }

    getYLevel(): number {
        return this.assignedUnit.lane === Lane.Front
            ? FrontGroundYLevel
            : BackGroundYLevel;
    }

    // --- Private ---

    private get groundPos(): Vector {
        return vec(this.pos.x, this.getYLevel());
    }

    private snapToGround(): void {
        this.pos = this.groundPos;
    }

    private registerPointerEvents(engine: Engine): void {
        this.on("pointerenter", this.onPointerEnter.bind(this));
        this.on("pointerleave", this.onPointerLeave.bind(this));
        this.on("pointerdown", this.onPointerDown.bind(this));

        engine.input.pointers.primary.on("move", this.onPointerMove.bind(this));
        engine.input.pointers.primary.on("up", this.onPointerUp.bind(this));
    }

    private onPointerEnter(_evt: PointerEvent): void {
        if (this.isHidden) return;

        this.pos = this.groundPos.add(HOVER_LIFT_OFFSET);
        this.setTint(Color.Red);
        this.assignedUnit.select();
    }

    private onPointerLeave(_evt: PointerEvent): void {
        if (this.isHidden || this.isDragging) return;

        this.snapToGround();
        this.assignedUnit.deselect();
        this.clearTint();
    }

    private onPointerDown(evt: PointerEvent): void {
        if (this.isHidden || evt.button === PointerButton.Right) return;

        this.isDragging = true;
        this.assignedUnit.select();
        this.dragOffset = this.pos.sub(evt.worldPos);
    }

    private onPointerMove(evt: { worldPos: Vector }): void {
        if (!this.isDragging) return;

        const yLevel = this.getYLevel();
        const rawPos = evt.worldPos.add(this.dragOffset);
        this.pos = vec(rawPos.x, Math.min(rawPos.y, yLevel));
    }

    private onPointerUp(_evt: unknown): void {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.snapToGround();
        this.assignedUnit.moveTo(this.groundPos);
    }
}