import { Actor, clamp, Color, GraphicsGroup, Rectangle, vec, Vector } from 'excalibur';

export class ProgressBar extends Actor {
  private maxValue: number;
  private currentValue: number;
  private barWidth: number;
  private barHeight: number;
  private barColor: Color;

  // Allocated once in onInitialize, mutated in place after that
  private bg!: Rectangle;
  private fill!: Rectangle;

  constructor(
    pos: Vector,
    barWidth = 50,
    barHeight = 6,
    maxValue = 100,
    color = Color.Green,
    z = 1,
  ) {
    super({ pos: pos, anchor: vec(0.5, 1), z: z });
    this.barWidth = barWidth;
    this.barHeight = barHeight;
    this.maxValue = maxValue;
    this.currentValue = maxValue;
    this.barColor = color;
  }

  onInitialize(): void {
    this.bg = new Rectangle({
      width: this.barWidth,
      height: this.barHeight,
      color: Color.fromHex('#333333'),
    });

    this.fill = new Rectangle({
      width: this.barWidth,
      height: this.barHeight,
      color: this.barColor,
    });

    // Set up the graphic group once — we'll mutate fill.width from here on
    this.graphics.use(
      new GraphicsGroup({
        useAnchor: false,
        members: [
          { graphic: this.bg, offset: vec(0, 0) },
          { graphic: this.fill, offset: vec(0, 0) },
        ],
      })
    );
  }

  show(): void {
    this.graphics.isVisible = true;
  }

  hide(): void {
    this.graphics.isVisible = false;
  }

  setValue(current: number, max?: number): void {
    const maxChanged = max !== undefined && max !== this.maxValue;
    if (max !== undefined) this.maxValue = max;

    const next = clamp(current, 0, this.maxValue);
    if (next === this.currentValue && !maxChanged) return; // nothing to update

    this.currentValue = next;
    if (this.fill) {
      this.fill.width = Math.max(this.barWidth * this.progress, 0.01);
    }
  }

  setColor(color: Color): void {
    this.barColor = color;
    if (this.fill) this.fill.color = color;
  }

  get progress(): number {
    return this.currentValue / this.maxValue;
  }
}