import { Actor, Canvas, Color, PointerEvent, Vector, vec } from "excalibur";

export interface CancelMoveButtonOptions {
    pos?: Vector;
    size?: number;
    z?: number;
}

export class CancelMoveButton extends Actor {
    private readonly size: number;

    constructor(private readonly onCancel: () => void, opts: CancelMoveButtonOptions = {}) {
        const size = opts.size ?? 22;
        super({
            pos: opts.pos ?? vec(0, -34),
            width: size,
            height: size,
            z: opts.z ?? 200,
        });
        this.size = size;

        this.pointer.useGraphicsBounds = true;
        this.graphics.add("idle", this.makeGraphic(Color.fromHex("#c0392bee")));
        this.graphics.add("hover", this.makeGraphic(Color.fromHex("#e74c3cff")));
        this.graphics.use("idle");
    }

    onInitialize() {
        this.on("pointerenter", () => this.graphics.use("hover"));
        this.on("pointerleave", () => this.graphics.use("idle"));
        this.on("pointerup", (evt: PointerEvent) => {
            evt.cancel();          // keep the click off the pawn / node underneath
            this.onCancel();
        });
    }

    private makeGraphic(fill: Color) {
        const s = this.size;
        return new Canvas({
            width: s,
            height: s,
            cache: true,
            draw: (ctx) => {
                const r = s / 2;
                ctx.clearRect(0, 0, s, s);

                ctx.beginPath();
                ctx.arc(r, r, r - 1, 0, Math.PI * 2);
                ctx.fillStyle = fill.toString();
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#ffffffdd";
                ctx.stroke();

                const p = s * 0.3;
                ctx.beginPath();
                ctx.moveTo(p, p);
                ctx.lineTo(s - p, s - p);
                ctx.moveTo(s - p, p);
                ctx.lineTo(p, s - p);
                ctx.lineWidth = 2.5;
                ctx.lineCap = "round";
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();
            },
        });
    }
}