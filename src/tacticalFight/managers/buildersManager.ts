import { Query, Scene } from "excalibur";
import { AssignedTaskComponent, BuilderComponent, BuildTaskComponent, ClaimedTaskComponent, VacantComponent } from "../components/components";
import { BuildTask } from "../buildTasks/buildTask";

export class BuildersManager {
    private readonly builders: Query<typeof BuilderComponent | typeof VacantComponent>;
    private readonly buildTasks: Query<typeof BuildTaskComponent>;

    constructor(scene: Scene) {
        this.builders = scene.world.query({
            components: { all: [BuilderComponent], not: [AssignedTaskComponent] },
        });
        this.buildTasks = scene.world.query({
            components: { all: [BuildTaskComponent] },
        });

        scene.on('preupdate', () => this.takeTasks("preupdate"))
    }

    takeTasks(caller: string) {
        if(this.buildTasks.entities.length === 0 || this.builders.entities.length === 0) return
        
        const tasks = this.buildTasks.entities.map(e => e.get(BuildTaskComponent).owner as BuildTask);

        for (const entity of [...this.builders.entities]) {
            if (tasks.length === 0) return;

            const builder = entity.get(BuilderComponent).builder;

            // closest remaining task
            let best = 0;
            for (let i = 1; i < tasks.length; i++) {
                if (tasks[i].pos.distance(builder.pos) < tasks[best].pos.distance(builder.pos)) best = i;
            }
            const [task] = tasks.splice(best, 1);
            builder.assignTask(task);
        }
    }
}