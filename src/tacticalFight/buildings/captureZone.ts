import { Actor, Color, Engine, Query, vec } from "excalibur";
import { AnimComponent } from "../components/animComponent";
import { Resources } from "../../resources";
import { IGroupable } from "../combatant";
import { Faction, FrontGroundYLevel } from "../../constants";
import { ProgressBar } from "../../progressBar";
import { GroupableComponent } from "../components/components";

export class CaptureZone extends Actor {
    captureProgress: number = 0;

    captureProgressIncreaseRate: number = 0.01;
    faction: Faction = Faction.Player; // The faction that currently controls the zone, default to Player
    private progressBar: ProgressBar;
    private nearbyPlayerCount: number = 0;
    private nearbyEnemyCount: number = 0;

    constructor(startPositionX: number, private readonly groupables: Query<typeof GroupableComponent>) {
        super({ name: 'CaptureZone', pos: vec(startPositionX, FrontGroundYLevel), width: 32, height: 32, z: 2, anchor: vec(0.5, 1) });
       
        this.addComponent(new AnimComponent(Resources.CaptureZoneFlag));
        this.color = Color.fromRGB(255, 255, 255, 0.5); // Semi-transparent to indicate it's not fully built
        this.progressBar = new ProgressBar(vec(-16, -100), 32, 6, 100, 0, Color.Red);
        this.addChild(this.progressBar)
    }

    override onInitialize(engine: Engine): void {
        this.playAnimation("NotCaptured");
    }

    protected playAnimation(name: string): void {
        this.get(AnimComponent).play(name);
    }

    override onPreUpdate(engine: Engine, delta: number): void {
        super.onPreUpdate(engine, delta);

        // Reset counts each frame
        this.nearbyPlayerCount = 0;
        this.nearbyEnemyCount = 0;

        // Count nearby units by faction using a single pass
        for (let i = 0; i < this.groupables.entities.length; i++) {
            const groupable = this.groupables.entities[i].get(GroupableComponent).groupable;
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