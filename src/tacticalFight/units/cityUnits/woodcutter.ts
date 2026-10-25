import { Engine, Entity, Query, TransformComponent, vec, Vector } from "excalibur";
import { FrontGroundYLevel, zLabels, Faction } from "../../../constants";
import { Resources } from "../../../resources";
import { CityUnit } from "./cityUnit";
import { CutOrderComponent, LabelComponent, TreeComponent, VacantComponent, WoodStorageComponent, WorkplaceComponent } from "../../components/components";

type WoodcutterState = 'idle' | 'toTree' | 'cutting' | 'toStorage' | 'toWorkplace';

export class Woodcutter extends CityUnit {
    private readonly speed = 40;          // px/sec
    private readonly workRadius = 250;    // max distance (px) of a tree from the workplace
    private readonly cutDuration = 3000;  // ms to get all the wood out of one tree
    private readonly idleDelay = 1000;    // ms to rest at the workplace before searching again
    private readonly carryCapacity = 7;

    carriedWoodAmount: number = 0;

    private state: WoodcutterState = 'toWorkplace';
    private timer = 0;                    // idle rest countdown
    private gatherBuffer = 0;             // fractional wood gathered but not yet added to the carried amount
    private targetTree?: Entity;
    private storage?: WoodStorageComponent;

    constructor(
        posX: number,
        private readonly trees: Query<typeof TreeComponent | typeof CutOrderComponent>,
        private readonly woodStorages: Query<typeof WoodStorageComponent>,
        private readonly workplace: WorkplaceComponent,
        private readonly workplacePosition: Vector
    ) {
        const config = { name: 'Woodcutter', pos: vec(posX, FrontGroundYLevel), width: 16, height: 16, anchor: vec(0.5, 1), z: zLabels.CityUnits };
        super(config, Resources.Woodcutter, 100, Faction.Player, 1);

        this.destination = workplacePosition;
        this.addComponent(new VacantComponent());
        this.addComponent(new LabelComponent(vec(0, -24), () => this.carriedWoodAmount.toString(), 6));
    }

    onPreUpdate(_engine: Engine, elapsed: number) {
        this.get(LabelComponent).refresh();
        this.updateState(elapsed);

        if (this.state === 'cutting' || this.destinationReached(this.destination)) {
            this.vel.x = 0;
            return;
        }

        const dx = this.destination.x - this.pos.x;
        this.vel.x = Math.sign(dx) * this.speed;
        this.graphics.flipHorizontal = dx < 0;
    }

    override onPostUpdate(_engine: Engine, _elapsed: number): void {
        if (this.destinationReached(this.workplacePosition))
            this.pos = vec(this.pos.x, this.workplacePosition.y);
        else
            this.pos = vec(this.pos.x, FrontGroundYLevel);
    }

    private updateState(elapsed: number) {
        switch (this.state) {
            case 'idle': {
                this.destination = this.workplacePosition;
                this.timer -= elapsed;
                if (this.timer > 0) break;

                // Carrying wood that still needs delivering (e.g. there was no storage earlier)
                if (this.carriedWoodAmount > 0) {
                    this.findStorage();
                    if (this.storage) {
                        this.setState('toStorage');
                        break;
                    }
                }

                if (this.findTree()) {
                    this.setState('toTree');
                } else {
                    this.timer = this.idleDelay; // nothing to cut, try again later
                }
                break;
            }

            case 'toTree': {
                if (!this.isTreeValid()) {
                    this.releaseTree();
                    this.setState('toWorkplace');
                    break;
                }
                this.destination = this.treePos()!;
                if (this.destinationReached(this.destination)) {
                    this.gatherBuffer = 0;
                    this.setState('cutting');
                }
                break;
            }

            case 'cutting': {
                if (!this.isTreeValid()) {
                    this.releaseTree();
                    this.setState(this.carriedWoodAmount > 0 ? 'toStorage' : 'toWorkplace');
                    break;
                }

                this.gatherWood(elapsed);

                const remaining = this.targetTree!.get(TreeComponent).woodLeft;
                const full = this.carriedWoodAmount >= this.carryCapacity;

                if (remaining <= 0) {
                    this.fellTree();
                    // Keep cutting nearby trees until the bag is full
                    if (!full && this.findTree()) {
                        this.setState('toTree');
                    } else {
                        this.setState(this.carriedWoodAmount > 0 ? 'toStorage' : 'toWorkplace');
                    }
                } else if (full) {
                    // Bag is full but the tree still has wood: leave it for the next trip
                    this.releaseTree();
                    this.setState('toStorage');
                }
                break;
            }

            case 'toStorage': {
                if (this.carriedWoodAmount <= 0) {
                    this.setState('toWorkplace');
                    break;
                }
                if (!this.storage || this.storage.owner?.isKilled()) {
                    this.findStorage();
                    if (!this.storage) { // no storage exists: keep the wood and go home
                        this.setState('toWorkplace');
                        break;
                    }
                }
                this.destination = this.storage.owner!.get(TransformComponent).globalPos;
                if (this.destinationReached(this.destination)) {
                    this.deliverWoodToStorage();
                    this.setState('toWorkplace');
                }
                break;
            }

            case 'toWorkplace': {
                this.destination = this.workplacePosition;
                if (this.destinationReached(this.destination)) {
                    this.setState('idle');
                }
                break;
            }
        }
    }

    private setState(next: WoodcutterState) {
        if (this.state === next) return;
        this.state = next;
        if (next === 'idle') this.timer = this.idleDelay;
    }

    // --- trees ---

    /** Picks the nearest free tree within workRadius of the workplace. Returns true if one was claimed. */
    private findTree(): boolean {
        if (this.carriedWoodAmount >= this.carryCapacity) return false;

        let best: Entity | undefined;
        let bestDist = Infinity;

        for (const tree of this.trees.entities) {
            const comp = tree.get(TreeComponent);
            if (tree.isKilled() || comp.isClaimed || comp.isDepleted) continue;

            const x = tree.get(TransformComponent)!.globalPos.x;
            if (Math.abs(x - this.workplacePosition.x) > this.workRadius) continue;

            const dist = Math.abs(x - this.pos.x);
            if (dist < bestDist) {
                bestDist = dist;
                best = tree;
            }
        }

        if (!best) return false;

        this.targetTree = best;
        best.get(TreeComponent).claim(this);
        return true;
    }

    private isTreeValid(): boolean {
        return this.targetTree !== undefined && !this.targetTree.isKilled();
    }

    private treePos(): Vector | undefined {
        return this.targetTree?.get(TransformComponent).globalPos;
    }

    private releaseTree() {
        this.targetTree?.get(TreeComponent)?.release(this);
        this.targetTree = undefined;
    }

    /** Moves wood from the tree into the carried amount gradually, as the cutting progresses. */
    private gatherWood(elapsed: number) {
        const tree = this.targetTree?.get(TreeComponent);
        if (!tree) return;

        this.gatherBuffer += (tree.totalWood / this.cutDuration) * elapsed;
        const whole = Math.floor(this.gatherBuffer);
        if (whole > 0) {
            const space = this.carryCapacity - this.carriedWoodAmount;
            this.carriedWoodAmount += tree.takeWood(Math.min(whole, space));
            this.gatherBuffer -= whole;
        }
    }

    /** Called when a tree has no wood left. */
    private fellTree() {
        if (!this.targetTree) return;
        this.targetTree.kill();
        this.releaseTree();
    }

    // --- storage ---

    private findStorage() {
        this.storage = undefined;
        let bestDist = Infinity;
        for (const e of this.woodStorages.entities) {
            const pos = e.get(TransformComponent)!.globalPos;
            const dist = Math.abs(pos.x - this.pos.x);
            if (dist < bestDist) {
                bestDist = dist;
                this.storage = e.get(WoodStorageComponent);
            }
        }
    }

    private deliverWoodToStorage() {
        if (!this.storage) return;
        this.storage.addWood(this.carriedWoodAmount);
        this.carriedWoodAmount = 0;
        this.storage = undefined;
    }

    // --- misc ---

    private destinationReached(destination: Vector) {
        return Math.abs(destination.x - this.pos.x) < 1;
    }

    onPreKill() {
        this.releaseTree();
        this.workplace?.onWorkerLost(this);
    }
}