import { Actor, clamp, Color, GraphicsGroup, Rectangle, vec, Vector } from 'excalibur';

export class ProgressBar extends Actor {
  private maxValue: number;
  private currentValue: number;
  private barWidth: number;
  private barHeight: number;
  private barColor: Color;

  constructor(
    pos: Vector,
    barWidth = 50,
    barHeight = 6,
    maxValue = 100,
    color = Color.Green
  ) {
    super({ pos: pos, anchor: vec(0.5, 1) });
    this.barWidth = barWidth;
    this.barHeight = barHeight;
    this.maxValue = maxValue;
    this.currentValue = maxValue;
    this.barColor = color;
  }

  onInitialize(): void {
    this.redraw();
  }

  setValue(current: number, max?: number): void {
    if (max !== undefined) this.maxValue = max;
    this.currentValue = clamp(current, 0, this.maxValue);
    this.redraw();
  }

  setColor(color: Color): void {
    this.barColor = color;
    this.redraw();
  }

  get progress(): number {
    return this.currentValue / this.maxValue;
  }

  private redraw(): void {
    const fillW = this.barWidth * this.progress;

    const bg = new Rectangle({
      width: this.barWidth,
      height: this.barHeight,
      color: Color.fromHex('#333333'),
    });

    const fill = new Rectangle({
      width: Math.max(fillW, 0.01), // avoids zero-width graphic glitch
      height: this.barHeight,
      color: this.barColor,
    });

    this.graphics.use(
      new GraphicsGroup({
        useAnchor: false,
        members: [
          { graphic: bg, offset: vec(0, 0) },
          { graphic: fill, offset: vec(0, 0) },
        ],
      })
    );
  }
}