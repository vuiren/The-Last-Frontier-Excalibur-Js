import * as ex from 'excalibur';

export class HealthBar extends ex.Actor {
  private maxHp: number;
  private currentHp: number;
  private barWidth: number;
  private barHeight: number;

  constructor(pos: ex.Vector, barWidth = 50, barHeight = 6, maxHp = 100) {
    super({ pos, anchor: ex.Vector.Zero });
    this.barWidth = barWidth;
    this.barHeight = barHeight;
    this.maxHp = maxHp;
    this.currentHp = maxHp;
  }

  onInitialize(): void {
    this.redraw();
  }

  setHealth(current: number, max?: number): void {
    if (max !== undefined) this.maxHp = max;
    this.currentHp = ex.clamp(current, 0, this.maxHp);
    this.redraw();
  }

  private getColor(): ex.Color {
    const pct = this.currentHp / this.maxHp;
    if (pct > 0.6) return ex.Color.Green;
    if (pct > 0.3) return ex.Color.Yellow;
    return ex.Color.Red;
  }

  private redraw(): void {
    const pct = this.currentHp / this.maxHp;
    const fillW = this.barWidth * pct;

    const bg = new ex.Rectangle({
      width: this.barWidth,
      height: this.barHeight,
      color: ex.Color.fromHex('#333333'),
    });

    const fill = new ex.Rectangle({
      width: fillW,
      height: this.barHeight,
      color: this.getColor(),
    });

    const group = new ex.GraphicsGroup({
      useAnchor: false, // required in v0.26+ so bounds don't shift
      members: [
        { graphic: bg,   offset: ex.vec(0, 0) },
        { graphic: fill, offset: ex.vec(0, 0) },
      ],
    });

    this.graphics.use(group);
  }
}