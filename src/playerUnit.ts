import { Vector, Engine, PointerButton, Color, vec } from "excalibur";
import { Lane, Faction } from "./constants";
import { Group } from "./group";
import { spawnUnitMoveMarker } from "./spawnFunctions";
import { Unit } from "./unit";
import { UnitMoveMarker } from "./unitMoveMarker";

export class PlayerUnit extends Unit {
    isSelected = false;
    moveMarker: UnitMoveMarker | null = null;
    private onClick: (unit: Unit) => void;
    private onRightClick: (unit: Unit) => void;

    constructor(
        startPosition: Vector,
        allUnits: Unit[],
        onClick: (unit: Unit) => void,
        onRightClick: (unit: Unit) => void,
        startLane = Lane.Front,
        health = 25
    ) {
        super(startPosition, allUnits, Faction.Player, startLane, health);
        this.onClick = onClick;
        this.onRightClick = onRightClick;
    }

    override onInitialize(engine: Engine): void {
        super.onInitialize(engine);
        this.pointer.useGraphicsBounds = true;
        this.on('pointerup', (evt) => {
            evt.cancel();
            if (evt.button === PointerButton.Left) this.onClick(this);
            else if (evt.button === PointerButton.Right) this.onRightClick(this);
        });
        this.moveMarker = spawnUnitMoveMarker(engine.currentScene, this, this.pos);
    }

    select() {
        this.isSelected = true;
        this.sprite.tint = Color.Red;
    }

    deselect() {
        this.isSelected = false;
        this.sprite.tint = Color.White;
    }

    moveTo(destination: Vector, fromMoveMarker: boolean) {
        if (this.moveMarker && !fromMoveMarker) {
            this.moveMarker.pos = destination;
        } else {
            this.destination = destination;
        }
    }

    joinGroup(group: Group) {
        this.groupRef = group;
        if (this.id !== group.leader.id) this.hideMoveMarker();
    }

    leaveGroup() {
        this.groupRef = null;
        this.showMoveMarker();
    }

    hideMoveMarker() {
        if (this.moveMarker) {
            this.moveMarker.sprite.scale = vec(0.01, 0.01);
            this.moveMarker.pointer.useGraphicsBounds = false;
        }
    }

    showMoveMarker() {
        if (this.moveMarker) {
            this.moveMarker.sprite.scale = vec(0.6, 0.6);
            this.moveMarker.pointer.useGraphicsBounds = true;
        }
    }
}