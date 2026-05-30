import { Vector, Engine, PointerButton, Color, vec } from "excalibur";
import { IGroupable, ICombatant } from "../combatant";
import { HorizontalDirection, Lane } from "../constants";
import { Group } from "../group";
import { spawnUnitMoveMarker } from "../spawnFunctions";
import { UnitConfig } from "../unitConfigs";
import { UnitMoveMarker } from "../unitMoveMarker";
import { Unit, UnitActivity } from "./unit";


export class PlayerUnit extends Unit {
    isSelected = false;
    moveMarker!: UnitMoveMarker;
    private onClick: (unit: IGroupable) => void;
    private onRightClick: (unit: IGroupable) => void;
    private hasSightedEnemy = false;
    private hasActiveOrder = false;
    private closestEnemy: ICombatant | null = null;

    constructor(
        startPosition: Vector,
        allCombatants: ICombatant[],
        config: UnitConfig,
        onClick: (unit: IGroupable) => void,
        onRightClick: (unit: IGroupable) => void,
        startLane = Lane.Front,
    ) {
        super(startPosition, config, allCombatants, startLane);
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
        this.moveMarker = spawnUnitMoveMarker(engine.currentScene, this, this.globalPos);
    }

    protected override selectActivity(): UnitActivity {
        this.closestEnemy = this.findClosestEnemy();
        const isOutOfDistanceFromDestination = this.globalPos.distance(this.orderedDestination) > 5;

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
                this.orderedDestination = this.globalPos;
                this.lookDirection = this.closestEnemy!.globalPos.x < this.globalPos.x ? HorizontalDirection.Left : HorizontalDirection.Right;
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

    private tryPerformAttack(enemy: ICombatant): void {
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