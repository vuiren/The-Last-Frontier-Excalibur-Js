import { Actor, ActorArgs, Color, Engine, Font, FontUnit, Label, TextAlign } from "excalibur";

export class InGameLabel extends Label {
    constructor(cfg: ActorArgs, size: number = 12) {
        super({
            ...cfg,
            font: new Font({
                family: 'Arial',
                size: size,
                quality: 4,
                unit: FontUnit.Px,
                textAlign: TextAlign.Center,
                color: Color.White,
            }),
        })
    }
    delay: number = 1000

    show(): void {
        this.actions.clearActions()
        this.actions.fade(1, this.delay)
    }

    hide(): void {
        this.actions.clearActions()
        this.actions.fade(0, this.delay)
    }
}