import { Query, Scene } from "excalibur";
import { Tags } from "../../constants";
import { BuilderComponent, BuildTaskComponent } from "../components/components";

export class BuildersManager {
    private readonly builders: Query<typeof BuilderComponent>;
    private readonly buildTasks: Query<typeof BuildTaskComponent>;

    constructor(scene: Scene) {
        this.buildTasks = scene.world.query({ components: { all: [BuildTaskComponent] }, tags: { all: [Tags.Vacant] } });
        this.buildTasks.entityAdded$.subscribe(() => this.takeTasks());

        this.builders = scene.world.query({ components: { all: [BuilderComponent] }, tags: { all: [Tags.Vacant] } });
        this.builders.entityAdded$.subscribe(() => this.takeTasks());
    }

    takeTasks() {
        const tasks = this.buildTasks.entities.map(e => e.get(BuildTaskComponent).task);

        for (const entity of [...this.builders.entities]) {
            if (tasks.length === 0) return;

            const builder = entity.get(BuilderComponent).builder;

            // closest remaining task
            let best = 0;
            for (let i = 1; i < tasks.length; i++) {
                if (tasks[i].pos.distance(builder.pos) < tasks[best].pos.distance(builder.pos)) best = i;
            }
            const [task] = tasks.splice(best, 1);

            task.removeTag(Tags.Vacant);   // claimed, so no other builder takes it
            builder.assignTask(task);      // also removes the builder's Vacant tag
        }
    }
}