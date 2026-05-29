import { Vector, Engine, PointerButton, Color, vec } from "excalibur";
import { Direction, Lane } from "./constants";
import { Group } from "./group";
import { spawnUnitMoveMarker } from "./spawnFunctions";
import { Unit, UnitActivity } from "./unit";
import { UnitMoveMarker } from "./unitMoveMarker";
import { UnitConfig } from "./unitConfigs";

export class PlayerUnit extends Unit {
    isSelected = false;
    moveMarker!: UnitMoveMarker;
    private onClick: (unit: Unit) => void;
    private onRightClick: (unit: Unit) => void;
    private hasSightedEnemy = false;
    private hasActiveOrder = false;
    private closestEnemy: Unit | null = null;

    constructor(
        startPosition: Vector,
        allUnits: Unit[],
        config: UnitConfig,
        onClick: (unit: Unit) => void,
        onRightClick: (unit: Unit) => void,
        startLane = Lane.Front,
    ) {
        super(startPosition, config, allUnits, startLane);
        this.onClick = onClick;
        this.onRightClick = onRightClick;
    }

    override onInitialize(engine: Engine): void {
        super.onInitialize(engine);
        this.pointer.useGraphicsBounds = true;
        this.on('pointerup', (evt) => {
            evt.cancel();
            if (evt.button === PointerButton.Left) this.onClick(this);
            else if (evt.button === PointerButton.Right) this.onRightClick(this);
        });
        this.moveMarker = spawnUnitMoveMarker(engine.currentScene, this, this.pos);
    }

    protected override selectActivity(): UnitActivity {
        this.closestEnemy = this.findClosestEnemy();
        const isOutOfDistanceFromDestination = this.pos.distance(this.orderedDestination) > 5;

        if (this.closestEnemy) this.hasSightedEnemy = true;

        // Arriving clears the move order
        if (!isOutOfDistanceFromDestination) {
            this.hasActiveOrder = false;
        }

        switch (this.activity) {
            case "moving":
                // Only block attack if player explicitly ordered this move
                if (!this.hasActiveOrder && this.closestEnemy && this.isInAttackRange(this.closestEnemy)) {
                    return "attacking";
                }
                if (isOutOfDistanceFromDestination) return "moving";
                return "idle";

            case "attacking":
                if (isOutOfDistanceFromDestination) return "moving";
                if (this.closestEnemy && this.isInAttackRange(this.closestEnemy)) return "attacking";
                return "idle";
        }

        // First sighting — stop and engage
        if (this.closestEnemy && this.isInAttackRange(this.closestEnemy)) return "attacking";
        if (isOutOfDistanceFromDestination) return "moving";
        return "idle";
    }

    protected override onEnterActivity(activity: UnitActivity, _from: UnitActivity): void {
        switch (activity) {
            case "attacking":
                this.orderedDestination = this.pos;
                this.lookDirection = this.closestEnemy!.pos.x < this.pos.x ? Direction.Left : Direction.Right;
                if (!this.moveMarker.isDragging) {
                    this.moveMarker.pos = this.pos;
                }
                break;
        }
    }

    protected override onUpdateActivity(activity: UnitActivity): void {
        const enemy = this.findClosestEnemy();

        switch (activity) {
            case "movingAndAttacking":
                this.moveTowardDestination();
                this.tryPerformAttack(enemy!);
                break;
            case "attacking":
                this.vel = Vector.Zero;
                this.tryPerformAttack(enemy!);
                break;
            case "moving":
                this.moveTowardDestination();
                break;
            case "idle":
                this.vel = Vector.Zero;
                break;
        }
    }

    private tryPerformAttack(enemy: Unit): void {
        if (this.attackCooldown <= 0) {
            this.performAttack(enemy);
            this.attackCooldown = this.config.attackCooldown;
        }
    }

    override moveTo(destination: Vector): void {
        super.moveTo(destination);

        // Only block enemy interruption if unit has already seen an enemy before
        if (this.hasSightedEnemy) {
            this.hasActiveOrder = true;
        }
    }

    select() {
        this.isSelected = true;
        this.setTint(Color.Red);

        if (this.groupRef && this.groupRef.leader.id === this.id) {
            this.groupRef.members.forEach(member => {
                if (member.id !== this.id && member instanceof PlayerUnit) {
                    member.select()
                }
            })
        }
    }

    deselect() {
        this.isSelected = false;
        this.setTint(Color.White);

        if (this.groupRef && this.groupRef.leader.id === this.id) {
            this.groupRef.members.forEach(member => {
                if (member.id !== this.id && member instanceof PlayerUnit) {
                    member.deselect()
                }
            })
        }
    }

    override joinGroup(group: Group) {
        super.joinGroup(group);
        if (this.id !== group.leader.id) this.hideMoveMarker();
    }

    override leaveGroup() {
        super.leaveGroup();
        this.showMoveMarker();
    }

    hideMoveMarker() {
        if (this.moveMarker) {
            this.moveMarker.scale = vec(0.01, 0.01);
            this.moveMarker.pointer.useGraphicsBounds = false;
            this.moveMarker.isHidden = true;
        }
    }

    showMoveMarker() {
        if (this.moveMarker) {
            this.moveMarker.scale = vec(0.6, 0.6);
            this.moveMarker.pointer.useGraphicsBounds = true;
            this.moveMarker.isHidden = false;
        }
    }
}