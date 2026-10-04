import { Actor, Canvas, Color, Vector, vec } from "excalibur";

export interface NodeCountBadgeOptions {
    pos?: Vector;
    radius?: number;
    z?: number;
    fill?: Color;
    stroke?: Color;
    textColor?: Color;
    /** Badge stays hidden while count <= this. Use 1 to only show stacks. */
    hideAtOrBelow?: number;
}

export class NodeCountBadge extends Actor {
    private count = 0;
    private readonly radius: number;
    private readonly fill: Color;
    private readonly stroke: Color;
    private readonly textColor: Color;
    private readonly hideAtOrBelow: number;
    private readonly canvas: Canvas;

    constructor(opts: NodeCountBadgeOptions = {}) {
        const radius = opts.radius ?? 12;
        super({
            pos: opts.pos ?? vec(18, -18),
            width: radius * 2,
            height: radius * 2,
            z: opts.z ?? 100,
        });

        this.radius = radius;
        this.fill = opts.fill ?? Color.fromHex("#1b1b24ee");
        this.stroke = opts.stroke ?? Color.fromHex("#ffffffcc");
        this.textColor = opts.textColor ?? Color.White;
        this.hideAtOrBelow = opts.hideAtOrBelow ?? 1;

        this.canvas = new Canvas({
            width: radius * 2,
            height: radius * 2,
            cache: true,
            draw: (ctx) => this.render(ctx),
        });

        this.graphics.use(this.canvas);
        this.graphics.isVisible = false;
    }

    setCount(value: number) {
        if (this.count === value) return;
        this.count = value;
        this.graphics.isVisible = value > this.hideAtOrBelow;
        this.canvas.flagDirty();
    }

    private render(ctx: CanvasRenderingContext2D) {
        const r = this.radius;
        ctx.clearRect(0, 0, r * 2, r * 2);

        ctx.beginPath();
        ctx.arc(r, r, r - 1, 0, Math.PI * 2);
        ctx.fillStyle = this.fill.toString();
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.stroke.toString();
        ctx.stroke();

        ctx.fillStyle = this.textColor.toString();
        ctx.font = `bold ${Math.round(r * 1.15)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(this.count), r, r + 1);
    }
}