import { Color, ExcaliburGraphicsContext, Vector } from "excalibur";

const DEFAULT_COLOR = Color.fromHex('#00FF88');

export function drawDottedLine(
    ctx: ExcaliburGraphicsContext,
    dashOffset: number,
    from: Vector,
    to: Vector,
    color = DEFAULT_COLOR,
    dashLen = 6,
    gapLen = 4
) {
    const delta = to.sub(from);
    const total = delta.magnitude;

    if (total === 0) return;

    const dir = delta.scale(1 / total);

    const cycle = dashLen + gapLen;
    const offset = ((dashOffset % cycle) + cycle) % cycle;

    let traveled = -offset;
    let drawing = false; // starts in a gap

    while (traveled < total) {
        const segLen = Math.min(drawing ? dashLen : gapLen, total - traveled);
        if (drawing) {
            const startX = from.x + dir.x * traveled;
            const startY = from.y + dir.y * traveled;
            const endX = from.x + dir.x * (traveled + segLen);
            const endY = from.y + dir.y * (traveled + segLen);
            ctx.drawLine(new Vector(startX, startY), new Vector(endX, endY), color, 1.5);
        }
        traveled += segLen;
        drawing = !drawing;
    }
}