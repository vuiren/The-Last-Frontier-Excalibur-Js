import { Query, Scene } from "excalibur";
import { UnemployedUnitComponent, VacantComponent } from "../components/components";
import { WorkplaceComponent } from "../components/workplaceComponent";

export class UnemployedManager {
    private readonly jobs: Query<typeof WorkplaceComponent | typeof VacantComponent>;
    private readonly unemployed: Query<typeof UnemployedUnitComponent | typeof VacantComponent>;

    constructor(scene: Scene) {
        this.jobs = scene.world.query({ components: { all: [WorkplaceComponent, VacantComponent] } });
        this.unemployed = scene.world.query({ components: { all: [UnemployedUnitComponent, VacantComponent] }});

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