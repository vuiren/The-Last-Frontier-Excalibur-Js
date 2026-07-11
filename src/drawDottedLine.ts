import { Color, ExcaliburGraphicsContext, Vector } from "excalibur";

export function drawDottedLine(
    ctx: ExcaliburGraphicsContext,
    dashOffset: number,
    from: Vector,
    to: Vector,
    color = Color.fromHex('#00FF88'),
    dashLen = 6,
    gapLen = 4
) {
    const dir = to.sub(from).normalize();
    const total = to.sub(from).magnitude;
    let traveled = -dashOffset;
    let drawing = false; // starts in a gap


    ctx.save();
    while (traveled < total) {
        const segLen = Math.min(drawing ? dashLen : gapLen, total - traveled);
        if (drawing) {
            const start = from.add(dir.scale(traveled));
            const end = from.add(dir.scale(traveled + segLen));
            ctx.drawLine(start, end, color, 1.5);
        }
        traveled += segLen;
        drawing = !drawing;
    }
    ctx.restore();
}