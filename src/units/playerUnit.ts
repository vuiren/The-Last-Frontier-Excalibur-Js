import { Vector, Engine, Color } from "excalibur";
import { ICombatant, IGroupable } from "../combatant";
import { HorizontalDirection } from "../constants";
import { Group } from "../group";
import { UnitConfig } from "../unitConfigs";
import { UnitMoveMarker } from "../unitMoveMarker";
import { Unit, UnitActivity } from "./unit";
import { EntitySpawner } from "../entitySpawner";
import { GroupsManager } from "../groupsManager";

export class PlayerUnit extends Unit {
    private isSelected = false;
    private moveMarker!: UnitMoveMarker;
    private hasSightedEnemy = false;
    private hasActiveOrder = false;
    private bestEnemy: ICombatant | null = null;

    constructor(
        posX: number,
        allCombatants: ICombatant[],
        allGroupables: IGroupable[],
        config: UnitConfig,
        private readonly groupsManager: GroupsManager,
        private readonly entitySpawner: EntitySpawner,
    ) {
        super(posX, config, allCombatants, allGroupables);
    }

    override onInitialize(engine: Engine): void {
        super.onInitialize(engine);
        this.moveMarker = this.entitySpawner.spawnUnitMoveMarker(this, this.globalPos);
        this.moveMarker.onHoverStart = () => this.select();
        this.moveMarker.onHoverEnd = () => this.deselect();
        this.moveMarker.onDragEnd = (destination) => this.moveTo(destination);
        this.moveMarker.onDragStart = () => this.extractFromGroupIfFollower();

        this.pointer.useGraphicsBounds = true;
    }

    override onPointerEnter() {
        super.onPointerEnter();
        if (this.activity === "idle") {
            this.toggleFollowerMarkers(true);
        }
    }

    override onPointerLeave() {
        super.onPointerLeave();
        this.toggleFollowerMarkers(false);
    }
    // ------------------------------------------------------------------ //
    //  Group split                                                         //
    // ------------------------------------------------------------------ //

    private toggleFollowerMarkers(set: boolean): void {
        if (!this.groupRef || this.groupRef.leader.id === this.id) return;
        this.moveMarker.setFollowerMode(set);
    }

    private extractFromGroupIfFollower(): void {
        if (!this.groupRef || this.groupRef.leader.id === this.id) return;
        this.groupsManager.removeFromAnyGroup(this);
    }

    // ------------------------------------------------------------------ //
    //  Activity selection                                                  //
    // ------------------------------------------------------------------ //

    protected override selectActivity(): UnitActivity {
        if (this.isDead) return "dead";

        if (this.groupRef !== null && this.groupRef.leader.id === this.id) {
            this.groupRef.spreadNow();
        }

        this.bestEnemy = this.findBestEnemy();
        const isOutOfDistanceFromDestination = this.globalPos.distance(this.orderedDestination) > 5;

        if (this.bestEnemy) this.hasSightedEnemy = true;

        if (!isOutOfDistanceFromDestination) {
            this.hasActiveOrder = false;
        }

        switch (this.activity) {
            case "moving":
                if (!this.hasActiveOrder && this.bestEnemy && this.isInAttackRange(this.bestEnemy)) {
                    return "attacking";
                }
                if (isOutOfDistanceFromDestination) return "moving";
                return "idle";

            case "attacking":
                if (isOutOfDistanceFromDestination) return "moving";
                if (this.bestEnemy && this.isInAttackRange(this.bestEnemy)) return "attacking";
                return "idle";
        }

        if (this.bestEnemy && this.isInAttackRange(this.bestEnemy)) return "attacking";
        if (isOutOfDistanceFromDestination) return "moving";
        if (this.isUnitHovered) return "greeting";
        return "idle";
    }

    protected override onEnterActivity(activity: UnitActivity, _from: UnitActivity): void {
        switch (activity) {
            case "attacking":
                this.orderedDestination = this.globalPos;
                this.lookDirection = this.bestEnemy!.globalPos.x < this.globalPos.x
                    ? HorizontalDirection.Left
                    : HorizontalDirection.Right;
                if (!this.moveMarker.isDragging) {
                    this.moveMarker.snapToUnit();
                }
                break;
        }
    }

    protected override onUpdateActivity(activity: UnitActivity): void {
        switch (activity) {
            case "attacking":
                this.vel.setTo(0, 0);
                this.tryPerformAttack(this.bestEnemy!);
                break;
            case "moving":
                this.moveTowardDestination();
                break;
            case "idle":
                this.vel.setTo(0, 0);
                break;
        }
    }

    private tryPerformAttack(enemy: ICombatant): void {
        if (!enemy) return;
        if (this.attackCooldown <= 0) {
            this.performAttack(enemy);
            this.attackCooldown = this.config.attackCooldown;
        }
    }

    // ------------------------------------------------------------------ //
    //  Movement                                                            //
    // ------------------------------------------------------------------ //

    override moveTo(destination: Vector): void {
        super.moveTo(destination);
        if (this.hasSightedEnemy) {
            this.hasActiveOrder = true;
        }
    }

    // ------------------------------------------------------------------ //
    //  Selection                                                           //
    // ------------------------------------------------------------------ //

    select(selectColor = Color.Red): void {
        if (this.isSelected) return;
        this.isSelected = true;
        this.setTint(selectColor);
        this.propagateToGroupMembers(m => m.select());
    }

    deselect(): void {
        if (!this.isSelected) return;
        this.isSelected = false;
        this.setTint(Color.White);
        this.propagateToGroupMembers(m => m.deselect());
    }

    private propagateToGroupMembers(action: (member: PlayerUnit) => void): void {
        if (!this.groupRef || this.groupRef.leader.id !== this.id) return;
        for (const member of this.groupRef.members) {
            if (member.id !== this.id && member instanceof PlayerUnit) {
                action(member);
            }
        }
    }

    // ------------------------------------------------------------------ //
    //  Group membership                                                    //
    // ------------------------------------------------------------------ //

    override joinGroup(group: Group): void {
        super.joinGroup(group);
        // Followers hide their own leader-style marker; it reappears as a
        // small follower handle when the group is hovered.
        if (this.id !== group.leader.id) this.moveMarker.setVisible(false);
    }

    override leaveGroup(): void {
        super.leaveGroup();
        this.moveMarker.setVisible(true);
    }

    override onRoleInGroupChanged(): void {
        if (this.groupRef) {
            this.moveMarker.setVisible(this.id === this.groupRef.leader.id);
        }
    }

    override cleanUpOnDeath(): void {
        super.cleanUpOnDeath();
        this.deselect();
        this.moveMarker.kill();

        this.entitySpawner.spawnDeadSoldier(this.pos.x);
    }
}