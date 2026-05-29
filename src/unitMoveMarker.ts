import { Actor, Engine, Animation, Vector, PointerEvent, vec, PointerButton, Color } from "excalibur";
import { Unit } from "./unit";
import { Resources } from "./resources";
import { BackGroundYLevel, FrontGroundYLevel, Lane } from "./constants";
import { PlayerUnit } from "./playerUnit";
import { AnimComponent } from "./animComponent";

export class UnitMoveMarker extends Actor {
    allUnits: Unit[] = []
    assignedUnit: PlayerUnit
    isDragging: boolean = false;
    isHidden: boolean = false;
    private dragOffset: Vector = Vector.Zero;
    private animComponent = new AnimComponent(Resources.FlagMarker);

    constructor(startPosition: Vector, assignedUnit: PlayerUnit) {
        super({ name: 'Unit', pos: startPosition, width: 9, height: 24, z: -1 });
        this.assignedUnit = assignedUnit

        this.assignedUnit.on("beganAttacking", e => {
            this.pos = this.assignedUnit.pos
        })

        this.assignedUnit.on("died", e => {
            this.kill()
        })
    }

    override onInitialize(engine: Engine): void {
        this.scale = vec(4, 4);
        this.animComponent.play('Idle', this.graphics);

        this.on('pointerenter', (evt: PointerEvent) => {
            if (this.isHidden) return;

            this.pos = vec(this.pos.x, this.getYLevel()).add(vec(0, -10));
            this.setTint(Color.Red)
            this.assignedUnit.select()
        })

        this.on('pointerleave', (evt: PointerEvent) => {
            if (this.isHidden) return;

            if (!this.isDragging) {
                this.pos = vec(this.pos.x, this.getYLevel());

                this.assignedUnit.deselect()
                this.clearTint()
            }
        })

        this.on('pointerdown', (evt: PointerEvent) => {
            if (this.isHidden) return;

            if (evt.button === PointerButton.Right) {
                return
            }

            this.isDragging = true;
            this.assignedUnit.select()
            // Store offset so the marker doesn't snap its center to the cursor
            this.dragOffset = this.pos.sub(evt.worldPos);
        });

        engine.input.pointers.primary.on('move', e => {
            if (this.isDragging) {
                this.pos = e.worldPos.add(this.dragOffset);
                const yLevel = this.getYLevel()
                if (this.pos.y > yLevel) {
                    this.pos = vec(this.pos.x, yLevel)
                }
            }
        })

        engine.input.pointers.primary.on('up', (evt) => {
            if (!this.isDragging) return;

            this.isDragging = false;
            const targetPos = vec(this.pos.x, this.getYLevel());
            this.pos = targetPos;
            this.assignedUnit.moveTo(targetPos);
            this.assignedUnit.deselect();
            this.clearTint();
        });
    }

    setTint(color: Color): void {
        this.animComponent.setTint(color);
    }

    clearTint(): void {
        this.animComponent.setTint(Color.White);
    }

    getYLevel() {
        return this.assignedUnit.lane === Lane.Front ? FrontGroundYLevel : BackGroundYLevel
    }
}