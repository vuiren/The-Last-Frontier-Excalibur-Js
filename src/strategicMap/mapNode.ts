import { Actor, Circle, Color, EventEmitter, Vector } from "excalibur";
import { Ownership } from "../constants";

export const OWNER_COLOR: Record<Ownership, Color> = {
    [Ownership.Player]: Color.fromHex('#3fa7ff'),
    [Ownership.Enemy]: Color.fromHex('#e0483e'),
    [Ownership.Neutral]: Color.fromHex('#7a828e'),
};

export interface MapNodeInfo {
    nodeId: string;
    owner: Ownership;
}

export class MapNode extends Actor {
    public customEvents = new EventEmitter<{
        nodeHovered: MapNodeInfo;
        nodeClicked: MapNodeInfo;
    }>();

    nodeId: string;
    owner: Ownership;

    get selected() { return this._selected; }
    set selected(value: boolean) {
        if (this._selected === value) return;
        this._selected = value;
        this.refreshGraphics();
    }

    private hovered = false;
    private _selected = false;
    private readonly circleGfx: Circle;

    constructor(pos: Vector, nodeId: string, ownership: Ownership) {
        super({
            pos: pos,
            z: 1,
        });

        this.nodeId = nodeId
        this.owner = ownership

        this.circleGfx = new Circle({
            radius: 20,
            color: OWNER_COLOR[ownership],
            strokeColor: Color.Black,
            lineWidth: 1,
        });
        this.graphics.use(this.circleGfx);

        this.on('pointerenter', () => this.onHoverStart());
        this.on('pointerleave', () => this.onHoverEnd());
        this.on('pointerdown', () => this.onPointerDown());
    }

    private onHoverStart() {
        this.hovered = true;
        this.customEvents.emit('nodeHovered', { nodeId: this.nodeId, owner: this.owner });
        this.refreshGraphics();
    }

    private onHoverEnd() {
        this.hovered = false;
        this.customEvents.emit('nodeHovered', null);
        this.refreshGraphics();
    }

    private refreshGraphics() {
        this.circleGfx.color = OWNER_COLOR[this.owner];

        if (this._selected) {
            this.circleGfx.strokeColor = Color.Yellow;
            this.circleGfx.lineWidth = 2;
        } else if (this.hovered) {
            this.circleGfx.strokeColor = Color.White;
            this.circleGfx.lineWidth = 1;
        } else {
            this.circleGfx.strokeColor = Color.Black;
            this.circleGfx.lineWidth = 1;
        }
    }

    private onPointerDown() {
        this.customEvents.emit('nodeClicked', { nodeId: this.nodeId, owner: this.owner })
        console.log(`MapNode clicked, owner: ${this.owner}`);
    }
}