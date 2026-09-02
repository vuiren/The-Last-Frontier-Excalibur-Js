import { Actor, vec, Vector } from "excalibur";
import { AnimComponent } from "../animComponent";
import { Resources } from "../resources";

export class MapPawn extends Actor {
    private readonly anim: AnimComponent = new AnimComponent(Resources.SoldierUnit)
    private _selected = false;

    private originalPos: Vector
    private selectedOffset = vec(0, -25)

    get selected() { return this._selected; }
    set selected(value: boolean) {
        if (this._selected === value) return;
        this._selected = value;
        this.refreshGraphics();
    }

    constructor(pos: Vector) {
        super({
            pos: pos,
        })

        this.originalPos = pos
        this.anim.play("Idle", this.graphics)
        this.scale = vec(3, 3)
    }

    private refreshGraphics() {
        if(this.selected)
            this.pos = this.originalPos.add(this.selectedOffset)
        else
            this.pos = this.originalPos
    }
}