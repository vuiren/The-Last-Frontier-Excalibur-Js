import { Actor, Color, Engine, PointerButton, vec, Vector } from "excalibur";
import { Faction, Lane } from "../constants";
import { Resources } from "../resources";
import { ICombatant, IGroupable } from "../combatant";
import { PlayerUnit } from "../units/playerUnit";


export class ChangeLaneButton extends Actor {
    allGroupables: IGroupable[] = [];
    private lane: Lane;
    private unitsInRange: PlayerUnit[] = [];

    constructor(startPosition: Vector, allGroupables: IGroupable[], lane: Lane) {
        super({ name: 'ChangeLaneButton', pos: startPosition, width: 8, height: 8, z: 2, anchor: vec(0.5, 1) });
        this.scale = lane === Lane.Front ? vec(0.05, 0.05) : vec(0.025, 0.025);
        this.color = Color.fromRGB(255, 255, 255, 0.5); // Semi-transparent to indicate it's not fully built
        this.lane = lane;
        this.allGroupables = allGroupables;
    }

    override onInitialize(engine: Engine): void {
        this.graphics.use(this.lane === Lane.Front ? Resources.UpArrow.toSprite() : Resources.DownArrow.toSprite());
        this.pointer.useGraphicsBounds = true;
        this.on('pointerenter', () => {
            this.color = Color.fromRGB(255, 255, 255, 0.8); // More opaque on hover
            const distanceThreshold = 100; // Adjust as needed
            this.unitsInRange = this.allGroupables.filter(c =>
                c.faction === Faction.Player
                && c.lane === this.lane
                && c.globalPos.distance(this.globalPos) <= distanceThreshold
                && (c.groupRef === null || c.groupRef.leader.id === c.id)
                && c instanceof PlayerUnit
            ).map(c => c as PlayerUnit);

            for (const unit of this.unitsInRange) {
                unit.select(Color.Yellow)
            }
        });

        this.on('pointerleave', () => {
            this.color = Color.fromRGB(255, 255, 255, 0.5); // Revert to original transparency
            for (const unit of this.unitsInRange) {
                unit.deselect();
            }
        });

        this.on('pointerup', (evt) => {
            evt.cancel();
            if (evt.button === PointerButton.Left) {

                for (const unit of this.unitsInRange) {
                    unit.changeLane(this.globalPos.x);
                }
            }
        });
    }
}