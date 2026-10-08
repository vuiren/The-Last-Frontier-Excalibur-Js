import { Engine, vec, Vector } from "excalibur";
import { FrontGroundYLevel, zLabels, Faction, Tags } from "../../../constants";
import { Resources } from "../../../resources";
import { CityUnit } from "./cityUnit";
import type { WorkplaceComponent } from "../../components/workplaceComponent";
import { BuildTask } from "../../buildings/buildTask";
import { AssignedTaskComponent, BuilderComponent } from "../../components/components";

export class Builder extends CityUnit {
    workplace?: WorkplaceComponent;

    private readonly buildIncreaseRate = 10;
    private readonly speed = 40; // px/sec

    constructor(posX: number, private readonly workplacePosition: Vector) {
        const config = { name: 'Builder', pos: vec(posX, FrontGroundYLevel), width: 16, height: 16, anchor: vec(0.5, 1), z: zLabels.CityUnits };
        super(config, Resources.Builder, 100, Faction.Player, 1);

        this.destination = workplacePosition
        this.addComponent(new BuilderComponent(this))
        this.addTag(Tags.Vacant)
    }

    onPreUpdate(_engine: Engine, elapsed: number) {
        const assigned = this.get(AssignedTaskComponent);
        if (assigned?.task.isKilled()) {       // task finished
            this.releaseTask();
            return;
        }

        if (assigned !== undefined) {
            const dx = this.destination.x - this.pos.x;
            if (Math.abs(dx) < 1) {
                assigned.task.build(this.buildIncreaseRate * elapsed)
            }
        }

        const dx = this.destination.x - this.pos.x;
        if (Math.abs(dx) < 1) {
            this.vel.x = 0; // arrived: stand at the workplace
            return;
        }
        this.vel.x = Math.sign(dx) * this.speed;
        this.graphics.flipHorizontal = dx < 0;
    }

    assignTask(task: BuildTask) {
        this.removeTag(Tags.Vacant);
        this.addComponent(new AssignedTaskComponent(task));
        this.destination = task.pos.clone();   // existing movement code walks there
    }

    private releaseTask() {
        this.addTag(Tags.Vacant);   // re-enters the builders query → manager fires takeTasks()
        this.removeComponent(AssignedTaskComponent);

        this.destination = this.workplacePosition
    }

    onPreKill() {
        const assigned = this.get(AssignedTaskComponent);
        if (assigned && !assigned.task.isKilled()) assigned.task.addTag(Tags.Vacant);

        this.workplace?.onWorkerLost(this);
    }
}