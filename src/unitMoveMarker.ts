import { Actor, Engine, Sprite, Vector, PointerEvent, vec, PointerButton } from "excalibur";
import { Unit } from "./unit";
import { Resources } from "./resources";
import { BackGroundYLevel, FrontGroundYLevel, Lane } from "./constants";
import { PlayerUnit } from "./playerUnit";

export class UnitMoveMarker extends Actor {
    allUnits: Unit[] = []
    assignedUnit: PlayerUnit
    sprite!: Sprite;
    private isDragging: boolean = false;
    private dragOffset: Vector = Vector.Zero;

    getYLevel() {
        return this.assignedUnit.lane === Lane.Front ? FrontGroundYLevel : BackGroundYLevel
    }

    constructor(startPosition: Vector, assignedUnit: PlayerUnit) {
        super({ name: 'Unit', pos: startPosition, width: 100, height: 100 });
        this.assignedUnit = assignedUnit

        this.assignedUnit.on("beganAttacking", e => {
            this.pos = this.assignedUnit.pos
        })

        this.assignedUnit.on("died", e => {
            this.kill()
        })
    }

    override onInitialize(engine: Engine): void {
        this.scale = vec(0.6, 0.6)

        this.sprite = Resources.Sword.toSprite();
        this.graphics.use(this.sprite);

        this.on('pointerenter', (evt: PointerEvent) => {
            evt.cancel();

            this.assignedUnit.select()
        })

        this.on('pointerleave', (evt: PointerEvent) => {
            evt.cancel();
            
            if (!this.isDragging)
                this.assignedUnit.deselect()
        })

        this.on('pointerdown', (evt: PointerEvent) => {
            if (evt.button === PointerButton.Right) {
                return
            }
            evt.cancel();

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

        this.on('pointerup', (evt: PointerEvent) => {
            evt.cancel();

            this.isDragging = false;
            this.pos.y = this.getYLevel()
            this.assignedUnit.deselect()
        });
    }

    override onPreUpdate(engine: Engine, elapsed: number): void {
        if (this.isDragging) return
        this.assignedUnit.moveTo(vec(this.pos.x, this.getYLevel()), true)
    }
}