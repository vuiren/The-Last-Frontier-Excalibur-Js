import { Actor, Circle, Color, Vector } from "excalibur";
import { Ownership } from "../constants";

export const OWNER_COLOR: Record<Ownership, Color> = {
    [Ownership.Player]: Color.fromHex('#3fa7ff'),
    [Ownership.Enemy]: Color.fromHex('#e0483e'),
    [Ownership.Neutral]: Color.fromHex('#7a828e'),
};

export class MapNode extends Actor {
    nodeId: string;
    owner: Ownership;
    private readonly circleGfx: Circle;

    constructor(pos: Vector, nodeId: string, ownership: Ownership) {
        super({
            pos: pos,
            z: 1,
        });
        
        this.nodeId = nodeId
        this.owner = ownership

        this.circleGfx = new Circle({
            radius: 40,
            color: OWNER_COLOR[ownership],
            strokeColor: Color.Black,
            lineWidth: 2,
        });
        this.graphics.use(this.circleGfx);

        this.on('pointerenter', () => this.onHoverStart());
        this.on('pointerleave', () => this.onHoverEnd());
        this.on('pointerdown', () => this.onPointerDown());
    }

    private onHoverStart() {
        this.circleGfx.strokeColor = Color.White;
    }

    private onHoverEnd() {
        this.circleGfx.strokeColor = Color.Black;
    }

    private onPointerDown() {
        console.log(`MapNode clicked, owner: ${this.owner}`);
    }
}