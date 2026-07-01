import { AsepriteResource } from "@excaliburjs/plugin-aseprite";
import { Animation, Color, GraphicsComponent } from "excalibur";

export class AnimComponent {
    private cache = new Map<string, Animation>();
    private current: Animation | null = null;
    private currentTint: Color = Color.White

    constructor(private resource: AsepriteResource) { }

    getAnim(name: string): Animation {
        if (!this.cache.has(name)) {
            this.cache.set(name, this.resource.getAnimation(name)!.clone());
        }
        return this.cache.get(name)!;
    }

    play(name: string, graphics: GraphicsComponent): void {
        const next = this.getAnim(name);
        if (this.current === next) return;
        this.current = next;
        this.setTint(this.currentTint)
        graphics.use(next);
    }

    setTint(color: Color): void {
        if (this.current){
            this.currentTint = color;
            this.current.tint = color;
        } 
    }

    flipHorizontal(value: boolean): void {
        if (this.current) this.current.flipHorizontal = value;
    }
}