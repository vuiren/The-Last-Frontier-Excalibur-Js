import { AsepriteResource } from "@excaliburjs/plugin-aseprite";
import { Animation, Color, Component, Entity, GraphicsComponent } from "excalibur";

export class AnimComponent extends Component {
    private cache = new Map<string, Animation>();
    private current: Animation | null = null;
    private currentTint: Color = Color.White
    private graphics!: GraphicsComponent;

    constructor(private resource: AsepriteResource) { super() }

    override onAdd(owner: Entity): void {
        this.graphics = owner.get(GraphicsComponent);
    }

    getAnim(name: string): Animation {
        if (!this.cache.has(name)) {
            this.cache.set(name, this.resource.getAnimation(name)!.clone());
        }
        return this.cache.get(name)!;
    }

    play(name: string): void {
        const next = this.getAnim(name);
        if (this.current === next) return;
        this.current = next;
        this.setTint(this.currentTint);
        this.graphics.use(next);
    }

    setTint(color: Color): void {
        this.currentTint = color;
        if (this.current) this.current.tint = color;
    }

    setResource(resource: AsepriteResource): void {
        this.resource = resource;
        this.cache.clear();
        this.current = null;   // next play() will pick up the new animation
    }

    flipHorizontal(value: boolean): void {
        if (this.current) this.current.flipHorizontal = value;
    }
}