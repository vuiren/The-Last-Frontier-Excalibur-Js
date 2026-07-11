import {
    Actor, Engine, Vector, PointerEvent,
    vec, PointerButton, Color
} from "excalibur";
import { Resources } from "./resources";
import { BackGroundYLevel, FrontGroundYLevel, GetMoveMarkerScaleByLane, GetScaleByLane, GetYLevel, Lane } from "./constants";
import { AnimComponent } from "./animComponent";
import { PlayerUnit } from "./units/playerUnit";
import { Unit } from "./units/unit";

const HOVER_LIFT_OFFSET = vec(0, -3);
const DRAG_TINT = Color.Red;
const Follower_Scale = 0.7;

export class UnitMoveMarker extends Actor {
    allUnits: Unit[] = [];
    assignedUnit: PlayerUnit;
    isDragging = false;
    isHidden = false;

    onDragStart: (() => void) | null = null;
    onDragEnd: ((destination: Vector) => void) | null = null;
    onHoverStart: (() => void) | null = null;
    onHoverEnd: (() => void) | null = null;

    private isHovered = false;
    private isFollowerMode = false;
    private dragOffset = Vector.Zero;
    private animComponent = new AnimComponent(Resources.FlagMarker);

    constructor(startPosition: Vector, assignedUnit: PlayerUnit) {
        super({
            name: "UnitMoveMarker",
            pos: startPosition,
            width: 9,
            height: 24,
            z: -1,
            anchor: vec(0.5, 1),
        });

        this.assignedUnit = assignedUnit;
        this.scale = GetMoveMarkerScaleByLane(assignedUnit.lane);

        assignedUnit.on("beganAttacking", () => {
            this.pos = assignedUnit.pos;
        });
    }

    override onInitialize(engine: Engine): void {
        this.animComponent.play("Idle", this.graphics);
        this.registerPointerEvents(engine);
    }

    override onPreUpdate(_engine: Engine, _elapsedMs: number): void {
        if (this.isFollowerMode) {
            if (!this.isDragging) {
                this.pos = this.assignedUnit.pos;
            }
            this.scale = GetScaleByLane(this.assignedUnit.lane).scale(Follower_Scale);
            return;
        }

        const targetLane = this.assignedUnit.lane;
        const targetY = GetYLevel(targetLane);
        const currentY = this.pos.y;
        const percent = currentY / targetY;
        this.scale = GetScaleByLane(targetLane).scale(percent);
    }

    // --- Public API ---

    /** Shows or hides the marker in normal leader mode. */
    setVisible(visible: boolean): void {
        this.graphics.isVisible = visible;
        this.pointer.useGraphicsBounds = visible;
        this.isHidden = !visible;
        // Becoming the leader always exits follower mode.
        if (visible) this.isFollowerMode = false;
    }

    /**
     * Shows/hides a small secondary handle used when the group is hovered.
     * The marker tracks the unit's position and can be dragged to extract
     * the follower from the group.
     */
    setFollowerMode(visible: boolean): void {
        this.isFollowerMode = visible;
        this.graphics.isVisible = visible;
        this.pointer.useGraphicsBounds = visible;
        this.isHidden = !visible;
        this.scale = GetScaleByLane(this.assignedUnit.lane).scale(Follower_Scale);

        // Snap immediately so there is no 1-frame flash at the stale position.
        if (visible) this.pos = this.assignedUnit.pos;
    }

    changeLane(targetX: number): void {
        this.pos = vec(targetX, this.groundY);
    }

    snapToUnit(): void {
        this.pos = this.assignedUnit.pos;
    }

    // --- Private ---

    private get groundY(): number {
        return this.assignedUnit.lane === Lane.Front
            ? FrontGroundYLevel
            : BackGroundYLevel;
    }

    private get groundPos(): Vector {
        return vec(this.pos.x, this.groundY);
    }

    private snapToGround(): void {
        this.pos = this.groundPos;
    }

    private applyHoverVisuals(): void {
        this.pos = this.groundPos.add(HOVER_LIFT_OFFSET);
        this.animComponent.setTint(DRAG_TINT);
        this.onHoverStart?.();
    }

    private clearHoverVisuals(): void {
        this.snapToGround();
        this.animComponent.setTint(Color.White);
        this.onHoverEnd?.();
    }

    private registerPointerEvents(engine: Engine): void {
        this.on("pointerdown", this.onPointerDown.bind(this));
        engine.input.pointers.primary.on("move", this.onPointerMove.bind(this));
        engine.input.pointers.primary.on("up", this.onPointerUp.bind(this));
    }

    private onPointerDown(evt: PointerEvent): void {
        if (this.isHidden || evt.button === PointerButton.Right) return;

        this.isDragging = true;
        this.dragOffset = this.pos.sub(evt.worldPos);
        this.applyHoverVisuals();
        this.onDragStart?.();
    }

    private onPointerMove(evt: { worldPos: Vector }): void {
        if (this.isDragging) {
            const rawPos = evt.worldPos.add(this.dragOffset);
            this.pos = vec(rawPos.x, Math.min(rawPos.y, this.groundY));
            return;
        }

        if (this.isHidden) return;

        const nowHovered = this.contains(evt.worldPos.x, evt.worldPos.y);

        if (nowHovered && !this.isHovered) {
            this.applyHoverVisuals();
        } else if (!nowHovered && this.isHovered) {
            this.clearHoverVisuals();
        }

        this.isHovered = nowHovered;
    }

    private onPointerUp(): void {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.snapToGround();

        if (!this.isHovered) {
            this.clearHoverVisuals();
        }

        this.onDragEnd?.(this.groundPos);
    }
}