import { AsepriteResource } from "@excaliburjs/plugin-aseprite"
import { Vector, Color, Actor, Component, Graphic, Entity } from "excalibur"

/**
 * What to show:
 *  - string → an Aseprite tag name (a 1-frame tag gives a static icon, more frames animate)
 *  - number → a raw frame index in the sprite sheet
 *  - null   → show nothing
 */
export type IconKey = string | number | null

export interface IconOptions {
    scale?: Vector
    z?: number
    tint?: Color
}

/** Child actor that holds the icon graphic. It is the image counterpart of InGameLabel. */
export class InGameIcon extends Actor {
    delay: number = 100

    constructor(pos: Vector, options: IconOptions = {}) {
        super({ pos, z: options.z, scale: options.scale })
    }

    show(): void {
        this.actions.clearActions()
        this.actions.fade(1, this.delay)
    }

    hide(): void {
        this.actions.clearActions()
        this.actions.fade(0, this.delay)
    }
}

export class IconComponent extends Component {
    private icon: InGameIcon
    private cache = new Map<string | number, Graphic>()
    private lastKey: IconKey | undefined = undefined
    private tint: Color

    constructor(
        offset: Vector,
        private resource: AsepriteResource,
        private getIcon: () => IconKey,
        options: IconOptions = {},
    ) {
        super()
        this.tint = options.tint ?? Color.White
        this.icon = new InGameIcon(offset, options)
    }

    override onAdd(owner: Entity) {
        owner.addChild(this.icon)
        this.refresh()
        this.hide()
    }

    override onRemove() {
        this.icon.kill()
    }

    /** Call this every frame or on events. It only swaps the graphic when the key changes. */
    refresh() {
        const key = this.getIcon()
        if (key === this.lastKey) return
        this.lastKey = key

        const graphic = key === null ? null : this.resolve(key)
        if (graphic) {
            this.icon.graphics.use(graphic)
        } else {
            this.icon.graphics.hide()
        }
    }

    setTint(color: Color): void {
        this.tint = color
        this.cache.forEach(g => (g.tint = color))
    }

    /** Swap to a different .aseprite file, for example another icon set. */
    setResource(resource: AsepriteResource): void {
        this.resource = resource
        this.cache.clear()
        this.lastKey = undefined // force the next refresh() to re-resolve
        this.refresh()
    }

    get delay(): number {
        return this.icon.delay
    }
    set delay(value: number) {
        this.icon.delay = value
    }

    show(): void {
        this.icon.show()
    }

    hide(): void {
        this.icon.hide()
    }

    private resolve(key: string | number): Graphic | null {
        let graphic = this.cache.get(key)
        if (graphic) return graphic

        // Clone each graphic so tint and animation state are not shared with other entities.
        graphic = typeof key === "number"
            ? this.resource.getSpriteSheet()?.sprites[key]?.clone()
            : this.resource.getAnimation(key)?.clone()

        if (!graphic) {
            console.warn(`IconComponent: no tag/frame "${key}" in aseprite resource`)
            return null
        }

        graphic.tint = this.tint
        this.cache.set(key, graphic)
        return graphic
    }
}