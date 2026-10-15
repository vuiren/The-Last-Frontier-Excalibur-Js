import { Engine, Query, TransformComponent, vec, Vector } from "excalibur";
import { FrontGroundYLevel, zLabels, Faction } from "../../../constants";
import { Resources } from "../../../resources";
import { CityUnit } from "./cityUnit";
import type { WorkplaceComponent } from "../../components/workplaceComponent";
import { BuildTask } from "../../buildTasks/buildTask";
import { AssignedTaskComponent, BuilderComponent, BuildTaskComponent, LabelComponent, VacantComponent, WoodStorageComponent } from "../../components/components";

type BuilderState = 'idle' | 'toWorkplace' | 'toStorage' | 'toTask' | 'building';

type TransitionEntry = { action?: () => void; delay?: number };

type TransitionMap = {
    [From in BuilderState]?: {
        [To in BuilderState]?: TransitionEntry;
    };
};

export class Builder extends CityUnit {
    private transitions: TransitionMap = {
        'building': {
            'toWorkplace': { action: () => this.releaseTask() },
            'toStorage': { action: () => this.findStorage() },
        },
        'toTask': {
            'toWorkplace': { action: () => this.releaseTask() },
            'toStorage': { action: () => this.findStorage() },
            'building': { action: () => this.deliverWoodToTask(), delay: 400 },
        },
        'idle': {
            'toStorage': { action: () => this.findStorage() },
        },
        'toStorage': {
            'toTask': { action: () => this.takeWoodFromStorage(), delay: 500 },
            'toWorkplace': { action: () => this.deliverWoodToStorage(), delay: 500 },
        },
        'toWorkplace': {
            'toStorage': { action: () => this.findStorage() },
            'idle': { delay: 500 }
        },
    };

    private readonly buildIncreaseRate = 0.01;
    private readonly speed = 40; // px/sec

    carriedWoodAmount: number = 0
    private state: BuilderState = 'toWorkplace';
    private storage?: WoodStorageComponent;
    private readonly carryCapacity = 7;

    private transitionCooldown = 0;

    constructor(posX: number, private readonly woodStorages: Query<typeof WoodStorageComponent>, workplace: WorkplaceComponent, private readonly workplacePosition: Vector) {
        const config = { name: 'Builder', pos: vec(posX, FrontGroundYLevel), width: 16, height: 16, anchor: vec(0.5, 1), z: zLabels.CityUnits };
        super(config, Resources.Builder, workplace, 100, Faction.Player, 1);

        this.destination = workplacePosition
        this.addComponent(new BuilderComponent(this))
        this.addComponent(new VacantComponent())

        this.addComponent(new LabelComponent(vec(0, -24), () => this.carriedWoodAmount.toString(), 6))
    }

    onPreUpdate(_engine: Engine, elapsed: number) {
        this.transitionCooldown = Math.max(0, this.transitionCooldown - elapsed);

        this.get(LabelComponent).refresh()
        this.updateState()

        switch (this.state) {
            case 'idle':
                break
            case 'building':
                if (this.hasTask && this.assignedTask.task) {
                    this.assignedTask.task.build(this.buildIncreaseRate * elapsed)
                }
                break
            case 'toTask':
                if (this.hasTask) {
                    this.destination = this.assignedTask.task.globalPos
                }
                break
            case 'toStorage':
                if (this.storage !== undefined) {
                    const pos = this.storage.owner?.get(TransformComponent).globalPos
                    if (pos !== undefined) {
                        this.destination = pos
                    }
                }
                break
            case 'toWorkplace':
                this.destination = this.workplacePosition
                break
        }

        if (this.destinationReached(this.destination)) {
            this.vel.x = 0; // arrived: stand at the workplace
            return;
        }

        if (this.transitionCooldown > 0) {
            this.vel.x = 0;
            return;
        }


        const dx = this.destination.x - this.pos.x;
        this.vel.x = Math.sign(dx) * this.speed;
        this.graphics.flipHorizontal = dx < 0;
    }

    override onPostUpdate(engine: Engine, elapsed: number): void {
        if (this.destinationReached(this.workplacePosition))
            this.pos = vec(this.pos.x, this.destination.y)
        else
            this.pos = vec(this.pos.x, FrontGroundYLevel)
    }

    updateState() {
        if (this.transitionCooldown > 0) return;

        const currentState = this.state
        const newState = this.getNewState()
        this.transition(currentState, newState)
    }

    getNewState(): BuilderState {
        const currentState = this.state
        switch (currentState) {
            case 'idle':
                if (this.hasTask && this.woodStorages.entities.length > 0) {
                    return 'toTask'
                }
                if (!this.destinationReached(this.workplacePosition)) {
                    return 'toWorkplace'
                }
                return 'idle'
            case 'toTask':
                if (!this.hasTask) return 'toWorkplace'

                if (!this.assignedTask.task.get(BuildTaskComponent).hasAllWood) {
                    if (this.carriedWoodAmount > 0) {
                        if (this.destinationReached(this.assignedTask.task.globalPos)) {
                            return 'building'
                        }
                        return 'toTask'
                    }
                    else
                        return 'toStorage'
                }
                if (this.destinationReached(this.assignedTask.task.globalPos)) {
                    return 'building'
                }

                return 'toTask'
            case 'toStorage':
                if (this.storage === undefined) return 'toWorkplace'

                if (this.destinationReached(this.storage.owner!.get(TransformComponent).globalPos)) {
                    if (this.hasTask)
                        return 'toTask'
                    else
                        return 'toWorkplace'
                }

                return 'toStorage'
            case 'toWorkplace':
                if (this.carriedWoodAmount > 0 && !this.hasTask) {
                    return 'toStorage'
                }
                if (this.destinationReached(this.workplacePosition)) return 'idle'
                return 'toWorkplace'
            case 'building':
                if (this.assignedTask?.task.isKilled()) return 'toWorkplace'
                if (this.assignedTask?.task.get(BuildTaskComponent).hasAllWood)
                    return 'building'
                else return 'toStorage'
        }

        return 'idle'
    }

    assignTask(task: BuildTask) {
        this.addComponent(new AssignedTaskComponent(task));
    }

    private releaseTask() {
        this.removeComponent(AssignedTaskComponent);
    }

    private destinationReached(destination: Vector) {
        return Math.abs(destination.x - this.pos.x) < 1
    }

    onPreKill() {
        const assigned = this.get(AssignedTaskComponent);
        if (assigned && !assigned.task.isKilled()) assigned.task.addComponent(new VacantComponent());

        this.workplace?.onWorkerLost(this);
    }

    transition(from: BuilderState, to: BuilderState) {
        if (from === to) return
        const fn = this.transitions[from]?.[to];
        if (fn) {
            if (fn.action)
                fn.action();
            if (fn.delay)
                this.transitionCooldown = fn.delay;
        }

        this.state = to

    }

    findStorage() {
        this.storage = undefined
        for (const e of this.woodStorages.entities) {
            const storage = e.get(WoodStorageComponent)
            if (storage.woodAmount > 0) {
                this.storage = storage
                break
            }
        }
    }

    takeWoodFromStorage() {
        if (!this.storage || !this.assignedTask) return
        const needed = this.assignedTask.task.get(BuildTaskComponent).requiredWoodAmount
        const want = Math.min(this.carryCapacity, needed) - this.carriedWoodAmount
        const amount = Math.max(0, Math.min(want, this.storage.woodAmount))

        this.storage.takeWood(amount)
        this.carriedWoodAmount += amount
        this.storage = undefined
    }

    deliverWoodToTask() {
        if (this.assignedTask === undefined) return
        const taskComponent = this.assignedTask?.task.get(BuildTaskComponent)
        if (taskComponent === undefined) return
        if (taskComponent.hasAllWood) return

        const woodToDeliver = Math.min(taskComponent.remainingWood, this.carriedWoodAmount)
        taskComponent.deliver(woodToDeliver)
        this.carriedWoodAmount -= woodToDeliver
    }

    deliverWoodToStorage() {
        if (this.storage === undefined) return

        this.storage.addWood(this.carriedWoodAmount)
        this.carriedWoodAmount = 0
    }

    get assignedTask() { return this.get(AssignedTaskComponent) }

    get hasTask() {
        return !(this.assignedTask === undefined || this.assignedTask?.task.isKilled())
    }
}