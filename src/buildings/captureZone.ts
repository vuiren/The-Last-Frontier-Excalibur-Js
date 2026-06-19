import { Actor, Color, Engine, vec, Vector } from "excalibur";
import { AnimComponent } from "../animComponent";
import { Resources } from "../resources";
import { IGroupable } from "../combatant";
import { Faction, Lane } from "../constants";
import { ProgressBar } from "../progressBar";

export class CaptureZone extends Actor {
    allGroupables: IGroupable[] = [];
    captureProgress: number = 0;

    captureProgressIncreaseRate: number = 0.1; // Adjust this value to control how fast the barricade scraps build up
    faction: Faction = Faction.Player; // The faction that currently controls the zone, default to Player
    private animComponent: AnimComponent;
    private progressBar: ProgressBar;
    private lane: Lane; // Default lane, you can modify this as needed

    constructor(startPosition: Vector, allGroupables: IGroupable[], lane: Lane) {
        super({ name: 'CaptureZone', pos: startPosition, width: 32, height: 32, z: 2, anchor: vec(0.5, 1) });
        this.animComponent = new AnimComponent(Resources.Barricade);
        this.scale = vec(2, 2);
        this.color = Color.fromRGB(255, 255, 255, 0.5); // Semi-transparent to indicate it's not fully built
        this.lane = lane;
        this.allGroupables = allGroupables;
        this.progressBar = new ProgressBar(startPosition.add(vec(-16, -50)), 32, 6, 100, Color.Red);
    }

    override onInitialize(engine: Engine): void {
        engine.currentScene.add(this.progressBar);
        this.playAnimation("Idle");
    }

    protected playAnimation(name: string): void {
        this.animComponent.play(name, this.graphics);
    }

    override onPreUpdate(engine: Engine, delta: number): void {
        super.onPreUpdate(engine, delta);
        // Check for nearby groupables and apply buffs
        const nearbyGroupables = this.allGroupables.filter(groupable => {
            const distance = this.pos.distance(groupable.globalPos);
            return groupable.activity === "idle" && groupable.faction === Faction.Player && distance < 50; // Adjust the radius as needed
        });

        nearbyGroupables.forEach(groupable => {
            this.captureProgress += this.captureProgressIncreaseRate * delta;
            console.log(`Applying barricade buff to groupable with ID: ${groupable.id}`);
        });

        this.progressBar.setValue(this.captureProgress);
        this.scale = vec(2 + 2 * (this.captureProgress / 100), 2 + 2 * (this.captureProgress / 100)); // Scale up as it builds

        if (this.captureProgress >= 100) {
            this.captureProgress = 100;
            this.kill();
            this.progressBar.kill();
        }
    }
}