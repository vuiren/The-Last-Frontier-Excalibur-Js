import { Query, Scene } from "excalibur";
import { UnemployedPlaceComponent, UnemployedUnitComponent, VacantComponent, WorkplaceComponent } from "../components/components";

export class UnemployedManager {
    private readonly jobs: Query<typeof WorkplaceComponent | typeof VacantComponent>;
    private readonly unemployed: Query<typeof UnemployedUnitComponent | typeof VacantComponent>;
    private readonly unemployedPlaces: Query<typeof UnemployedPlaceComponent | typeof VacantComponent>;

    constructor(scene: Scene) {
        this.jobs = scene.world.query({ components: { all: [WorkplaceComponent, VacantComponent] } });
        this.unemployed = scene.world.query({ components: { all: [UnemployedUnitComponent, VacantComponent] } });
        this.unemployedPlaces = scene.world.query({ components: { all: [UnemployedPlaceComponent, VacantComponent] } });

        this.jobs.entityAdded$.subscribe(() => this.findJobs());
        this.unemployed.entityAdded$.subscribe(() => this.findJobs());

        this.unemployed.entityAdded$.subscribe(() => this.findPlaces());
        this.unemployedPlaces.entityAdded$.subscribe(() => this.findPlaces())
    }

    findJobs() {
        for (const u of [...this.unemployed.entities]) {
            const unit = u.get(UnemployedUnitComponent).unemployed;
            for (const b of [...this.jobs.entities]) {
                if (b.get(WorkplaceComponent).hire(unit)) break;
            }
        }
    }

    findPlaces() {
        for (const u of [...this.unemployed.entities]) {
            const unit = u.get(UnemployedUnitComponent).unemployed;
            for (const b of [...this.unemployedPlaces.entities]) {
                if (b.get(UnemployedPlaceComponent).hire(unit)) break;
            }
        }
    }
}