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
    private nearbyPlayerCount: number = 0;
    private nearbyEnemyCount: number = 0;

    constructor(startPosition: Vector, allGroupables: IGroupable[], lane: Lane) {
        super({ name: 'CaptureZone', pos: startPosition, width: 32, height: 32, z: 2, anchor: vec(0.5, 1) });
        this.animComponent = new AnimComponent(Resources.CaptureZoneFlag);
        this.scale = vec(4, 4);
        this.color = Color.fromRGB(255, 255, 255, 0.5); // Semi-transparent to indicate it's not fully built
        this.lane = lane;
        this.allGroupables = allGroupables;
        this.progressBar = new ProgressBar(startPosition.add(vec(-16, -50)), 32, 6, 100, Color.Red);
    }

    override onInitialize(engine: Engine): void {
        engine.currentScene.add(this.progressBar);
        this.playAnimation("NotCaptured");
    }

    protected playAnimation(name: string): void {
        this.animComponent.play(name, this.graphics);
    }

    override onPreUpdate(engine: Engine, delta: number): void {
        super.onPreUpdate(engine, delta);

        // Reset counts each frame
        this.nearbyPlayerCount = 0;
        this.nearbyEnemyCount = 0;

        // Count nearby units by faction using a single pass
        for (let i = 0; i < this.allGroupables.length; i++) {
            const groupable = this.allGroupables[i];
            const distance = this.pos.distance(groupable.globalPos);
            if (distance >= 50) continue;

            if (groupable.faction === Faction.Player && groupable.activity === "idle") {
                this.nearbyPlayerCount++;
            } else if (groupable.faction === Faction.Enemy) {
                this.nearbyEnemyCount++;
            }
        }

        if (this.nearbyPlayerCount > this.nearbyEnemyCount) {
            this.captureProgress += this.captureProgressIncreaseRate * delta;
        } else if (this.nearbyEnemyCount > this.nearbyPlayerCount) {
            this.captureProgress -= this.captureProgressIncreaseRate * delta;
        }

        this.captureProgress = Math.max(0, Math.min(100, this.captureProgress));
        this.progressBar.setValue(this.captureProgress);

        if (this.captureProgress >= 100) {
            this.playAnimation("Captured");
            this.progressBar.hide();
            this.scale = vec(4, 4);
        } else {
            this.progressBar.show();
            this.playAnimation("NotCaptured");
            const scale = 2 + 2 * (this.captureProgress / 100);
            this.scale = vec(scale, scale);
        }
    }
}