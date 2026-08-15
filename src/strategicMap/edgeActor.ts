import { Actor, Color, Line, Vector, vec } from 'excalibur';
import { MapNode } from './mapNode';

export class EdgeActor extends Actor {
    constructor(readonly nodeA: MapNode, readonly nodeB: MapNode) {
        super({
            name: `edge-${nodeA.id}-${nodeB.id}`,
            pos: vec(0, 0),
        });

        this.graphics.anchor = Vector.Zero;
        this.graphics.use(
            new Line({
                start: nodeA.pos,
                end: nodeB.pos,
                color: Color.Black,
                thickness: 2,
            })
        );

        this.pointer.useColliderShape = false;
        this.pointer.useGraphicsBounds = false;
    }
}