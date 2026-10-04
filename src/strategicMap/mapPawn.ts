import { Actor, vec } from "excalibur";
import { AnimComponent } from "../animComponent";
import { Resources } from "../resources";
import { MapNode } from "./mapNode";
import { Ownership } from "../constants";

export class MapPawn extends Actor {
    faction: Ownership
    private readonly anim: AnimComponent
    private _selected = false;
    private _inFight = false;

    private ownerNode!: MapNode
    private targetNode: MapNode | null = null

    get selected() { return this._selected; }
    set selected(value: boolean) {
        if (this._selected === value) return;
        this._selected = value;
        this.refreshGraphics();
    }

    get inFight() { return this._inFight; }
    set inFight(value: boolean) {
        if (this._inFight === value) return;
        this._inFight = value;
        this.refreshGraphics();
    }

    constructor(ownerNode: MapNode) {
        super()

        this.faction = ownerNode.owner
        this.anim = new AnimComponent(this.faction === Ownership.Player ? Resources.SoldierUnit : Resources.SoldierZombie)
        this.anim.play("Idle", this.graphics)
        this.setOwnerNode(ownerNode)

        this.scale = vec(2, 2)
    }

    getOwnerNode() {
        return this.ownerNode
    }

    setOwnerNode(newNode: MapNode) {
        this.ownerNode = newNode
        this.refreshGraphics()
    }

    getTargetNode() {
        return this.targetNode
    }

    setTargetNode(newNode: MapNode | null) {
        this.targetNode = newNode
        this.refreshGraphics()
    }

    private refreshGraphics() {
        if (this.inFight) {
            this.anim.play("Shooting", this.graphics)
            return
        }

        if (this.targetNode) {
            this.anim.play("Walking", this.graphics)
            this.anim.flipHorizontal(this.ownerNode.pos.x > this.targetNode.pos.x)
            return
        }

        this.anim.play("Idle", this.graphics)
    }
}