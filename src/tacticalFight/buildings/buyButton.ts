import {
    Color, Engine, Font, FontUnit, GraphicsGroup, ImageSource, Rectangle,
    ScreenElement, Sprite, Text, TextAlign, vec
} from "excalibur";

export interface BuyButtonOptions {
    /** Text shown on the button, e.g. "Buy" or "Buy 50g" */
    label?: string;
    /** Optional icon shown to the left of the label */
    icon?: ImageSource;
    /** Called when the button is clicked and canBuy() (if provided) returns true */
    onBuy: () => void;
    /** Optional gate, e.g. () => player.gold >= 50 */
    canBuy?: () => boolean;
}

export class BuyButton extends ScreenElement {
    private defaultBox!: Rectangle;
    private hoverBox!: Rectangle;
    private disabledBox!: Rectangle;

    private group!: GraphicsGroup;
    private backgroundIndex = 0;

    private targetWidth: number;
    private targetHeight: number;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        private options: BuyButtonOptions
    ) {
        super({ x, y, width, height });
        this.targetWidth = width;
        this.targetHeight = height;
    }

    onInitialize(engine: Engine) {
        // --- Background variants (border baked in via strokeColor/lineWidth) ---
        this.defaultBox = new Rectangle({
            width: this.targetWidth,
            height: this.targetHeight,
            color: Color.Azure,
            strokeColor: Color.Black,
            lineWidth: 2
        });

        this.hoverBox = new Rectangle({
            width: this.targetWidth,
            height: this.targetHeight,
            color: Color.Cyan,
            strokeColor: Color.Black,
            lineWidth: 2
        });

        this.disabledBox = new Rectangle({
            width: this.targetWidth,
            height: this.targetHeight,
            color: Color.Gray,
            strokeColor: Color.Black,
            lineWidth: 2
        });

        // --- Build the member list once ---
        // Index 0 is always the background; we mutate its `graphic` on
        // hover/disable instead of rebuilding the whole group.
        const members: GraphicsGroup['members'] = [
            { graphic: this.defaultBox, offset: vec(0, 0) }
        ];

        let textOffsetX = this.targetWidth / 2;

        if (this.options.icon) {
            const sprite: Sprite = this.options.icon.toSprite();
            const iconOffset = vec(4, this.targetHeight / 2 - sprite.height / 2);
            members.push({ graphic: sprite, offset: iconOffset });

            // shift text right to make room for the icon
            textOffsetX = iconOffset.x + sprite.width + 4;
        }

        if (this.options.label) {
            const text = new Text({
                text: this.options.label,
                font: new Font({
                    size: 10,
                    unit: FontUnit.Px,
                    textAlign: TextAlign.Left,
                    color: Color.Black
                })
            });
            members.push({
                graphic: text,
                offset: vec(textOffsetX, this.targetHeight / 2 - 5)
            });
        }

        this.group = new GraphicsGroup({ members });
        this.backgroundIndex = 0;

        this.graphics.use(this.group);

        // --- Hover / click handling only mutates the background member ---
        this.on('pointerenter', () => {
            if (this.isDisabled()) return;
            this.setBackground(this.hoverBox);
            engine.canvas.style.cursor = 'pointer';
        });

        this.on('pointerleave', () => {
            if (this.isDisabled()) return;
            this.setBackground(this.defaultBox);
            engine.canvas.style.cursor = 'default';
        });

        this.on('pointerup', () => {
            if (this.isDisabled()) return;
            this.options.onBuy();
        });

        // Reflect canBuy() state each frame in case it changes externally
        this.on('postupdate', () => {
            const disabled = this.isDisabled();
            const wantsBox = disabled ? this.disabledBox : this.defaultBox;
            if (this.group.members[this.backgroundIndex] !== this.hoverBox) {
                this.setBackground(wantsBox);
            }
        });
    }

    private isDisabled(): boolean {
        return this.options.canBuy ? !this.options.canBuy() : false;
    }

    private setBackground(box: Rectangle) {
        this.group.members[this.backgroundIndex] = box;
        // GraphicsGroup caches its bounds/rasterization internally in some
        // Excalibur versions — if hover swaps don't visually update,
        // uncomment the next line to force a refresh:
        // this.graphics.use(this.group);
    }
}