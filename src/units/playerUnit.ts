import { Vector, Engine, PointerButton, Color } from "excalibur";
import { IGroupable, ICombatant } from "../combatant";
import { GetScaleByLane, GetYLevel, HorizontalDirection, Lane } from "../constants";
import { Group } from "../group";
import { spawnDeadSoldier, spawnUnitMoveMarker } from "../spawnFunctions";
import { UnitConfig } from "../unitConfigs";
import { UnitMoveMarker } from "../unitMoveMarker";
import { Unit, UnitActivity } from "./unit";
import { UnitsManager } from "../unitsManager";


export class PlayerUnit extends Unit {
    isSelected = false;
    moveMarker!: UnitMoveMarker;
    private onClick: (unit: IGroupable) => void;
    private onRightClick: (unit: IGroupable) => void;
    private hasSightedEnemy = false;
    private hasActiveOrder = false;
    private closestEnemy: ICombatant | null = null;
    private unitsManager: UnitsManager;

    constructor(
        startPosition: Vector,
        allCombatants: ICombatant[],
        config: UnitConfig,
        onClick: (unit: IGroupable) => void,
        onRightClick: (unit: IGroupable) => void,
        unitsManager: UnitsManager,
        startLane = Lane.Front,
    ) {
        super(startPosition, config, allCombatants, startLane);
        this.onClick = onClick;
        this.onRightClick = onRightClick;
        this.unitsManager = unitsManager;
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
        if (this.isDead) return "dead";

        const orderedY = GetYLevel(this.lane);
        const currentY = this.globalPos.y;
        if(Math.abs(currentY - orderedY) > 5) {
            return "crossingBridge";
        }

        if(this.previousActivity === "crossingBridge" && this.groupRef !== null && this.groupRef.leader.id === this.id) {
            this.groupRef.spreadNow()
        }

        this.closestEnemy = this.findBestEnemy();
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

        switch (activity) {
            case "movingAndAttacking":
                this.moveTowardDestination();
                const enemy = this.findBestEnemy();
                this.tryPerformAttack(enemy!);
                break;
            case "attacking":
                this.vel = Vector.Zero;
                const enemy2 = this.findBestEnemy();
                this.tryPerformAttack(enemy2!);
                break;
            case "moving":
                this.moveTowardDestination();
                break;
            case "idle":
                this.vel = Vector.Zero;
                break;
            case "crossingBridge":
                this.moveTowardDestination();
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

    select(selectColor = Color.Red) {
        this.isSelected = true;
        this.setTint(selectColor);
        this.moveMarker.select();

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
        this.moveMarker.deselect();

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

    override onRoleInGroupChanged() {
        if (this.groupRef) {
            if (this.id === this.groupRef.leader.id) {
                this.showMoveMarker();
            } else {
                this.hideMoveMarker();
            }
        }
    }

    override changeLane(targetX: number): void {
        super.changeLane(targetX);
        this.moveMarker.changeLane(targetX);
    }

    override cleanUpOnDeath() {
        super.cleanUpOnDeath();
        this.deselect();
        this.moveMarker.kill();
        spawnDeadSoldier(this.scene!, this.pos, this.unitsManager, this.lane);
    }

    hideMoveMarker() {
        if (this.moveMarker) {
            this.moveMarker.graphics.isVisible = false;
            this.moveMarker.pointer.useGraphicsBounds = false;
            this.moveMarker.isHidden = true;
        }
    }

    showMoveMarker() {
        if (this.moveMarker) {
            this.moveMarker.graphics.isVisible = true;
            this.moveMarker.pointer.useGraphicsBounds = true;
            this.moveMarker.isHidden = false;
        }
    }
}