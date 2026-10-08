import { Query, Scene } from "excalibur";
import { UnemployedUnitComponent } from "../components/components";
import { Tags } from "../../constants";
import { WorkplaceComponent } from "../components/workplaceComponent";

export class UnemployedManager {
    private readonly jobs: Query<typeof WorkplaceComponent>;
    private readonly unemployed: Query<typeof UnemployedUnitComponent>;

    constructor(scene: Scene) {
        this.jobs = scene.world.query({ components: { all: [WorkplaceComponent] }, tags: { all: [Tags.Vacant] } });
        this.unemployed = scene.world.query({ components: { all: [UnemployedUnitComponent] }, tags: { all: [Tags.Vacant] } });

        this.jobs.entityAdded$.subscribe(() => this.findJobs());
        this.unemployed.entityAdded$.subscribe(() => this.findJobs());
    }

    findJobs() {
        for (const u of [...this.unemployed.entities]) {
            const unit = u.get(UnemployedUnitComponent).unemployed;
            for (const b of [...this.jobs.entities]) {
                if (b.get(WorkplaceComponent).hire(unit)) break;
            }
        }
    }
}