class GroupConnector extends ex.Actor {
  private members: ex.Actor[];
  private canvas!: ex.Canvas;
  private dashOffset = 0;

  constructor(members: ex.Actor[]) {
    super({ x: 0, y: 0, anchor: ex.Vector.Zero });
    this.members = members;
  }

  onInitialize(engine: ex.Engine) {
    // Size it to the full screen so it can draw anywhere
    const { width, height } = engine.screen.resolution;

    this.canvas = new ex.Canvas({
      width,
      height,
      cache: false, // must redraw every frame since actors move
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = '#00FF88';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = this.dashOffset;

        for (let i = 0; i < this.members.length - 1; i++) {
          const a = this.members[i].pos;
          const b = this.members[i + 1].pos;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    });

    this.graphics.use(this.canvas);
  }

  onPreUpdate(engine: ex.Engine, delta: number) {
    this.dashOffset -= delta * 0.04; // marching ants animation
  }
}