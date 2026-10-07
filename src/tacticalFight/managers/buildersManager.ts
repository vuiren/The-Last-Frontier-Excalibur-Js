import { BuildTask } from "../buildings/buildTask";
import { Builder } from "../units/cityUnits/builder";

export class BuildersManager {
    constructor(
        private readonly allBuilders: Builder[],
        private readonly allBuildTasks: BuildTask[]) { }

}