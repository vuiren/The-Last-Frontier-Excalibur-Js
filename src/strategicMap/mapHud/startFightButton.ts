import * as ex from 'excalibur'
import { Resources } from '../../resources'

export class StartFightButton extends ex.Actor {
    constructor(pos: ex.Vector) {
        super({
            pos: pos,
        })
    }

    onInitialize() {
        const idleAnimation = Resources.StartFightButton.getAnimation('Idle')
        const hoverAnimation = Resources.StartFightButton.getAnimation('Hover')

        this.graphics.add('idle', idleAnimation!)
        this.graphics.add('hover', hoverAnimation!)
        this.graphics.use('idle')

        // Use the graphic's bounds as the clickable area
        this.pointer.useGraphicsBounds = true

        this.on('pointerup', () => {
            alert("I've been clicked")
        })

        this.on('pointerenter', () => {
            this.graphics.use('hover')
        })

        this.on('pointerleave', () => {
            this.graphics.use('idle')
        })

        this.scale = ex.vec(2, 2)
    }
}