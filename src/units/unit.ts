import { Actor, Vector, vec, Engine, Debug, Color } from "excalibur";
import { AnimComponent } from "../animComponent";
import { Bullet } from "../bullet";
import { ICombatant, IGroupable } from "../combatant";
import { Lane, Faction, AttackType, HorizontalDirection, GetYLevel, GetScaleByLane, GetHealthBarScaleByLane } from "../constants";
import { Group } from "../group";
import { ProgressBar } from "../progressBar";
import { UnitConfig } from "../unitConfigs";

export type UnitActivity = "idle" | "moving" | "chasing" | "attacking" | "dead" | "movingAndAttacking" | "crossingBridge";

const ACTIVITY_ANIMATION: Partial<Record<UnitActivity, string>> = {
    idle: "Idle",
    moving: "Walking",
    attacking: "Shooting",
    movingAndAttacking: "RunNShoot",
    crossingBridge: "Walking",
};

export class Unit extends Actor implements ICombatant, IGroupable {
    allCombatants: ICombatant[] = [];
    health: number;
    lane: Lane;
    groupRef: Group | null = null;
    lookDirection: HorizontalDirection = HorizontalDirection.Right;
    config: UnitConfig;
    orderedDestination: Vector;
    attackCooldown: number = 0;
    isDead: boolean = false;
    activity: UnitActivity = "idle";
    previousActivity: UnitActivity = "idle";
    timeInCurrentActivity: number = 0;
    faction: Faction;
    attackPriority: number = 0;

    private healthBar: ProgressBar;
    private animComponent: AnimComponent;

    constructor(startX: number, config: UnitConfig, allCombatants: ICombatant[], startLane = Lane.Front) {
        const startPosition = vec(startX, GetYLevel(startLane));
        super({ name: 'Unit', pos: startPosition, width: 16, height: 16, anchor: vec(0.5, 1) });
        this.config = config;
        this.allCombatants = allCombatants;
        this.orderedDestination = startPosition;
        this.lane = startLane;
        this.health = config.health;
        this.faction = config.faction;
        this.scale = GetScaleByLane(startLane);
        this.animComponent = new AnimComponent(config.graphicSource);

        this.healthBar = new ProgressBar(vec(0, 0), 20, 6, config.health);
        this.healthBar.scale = GetHealthBarScaleByLane(startLane);
    }

    // ------------------------------------------------------------------ //
    //  Getters                                                             //
    // ------------------------------------------------------------------ //

    protected get effectiveAttackRange(): number {
        return this.config.attackRange ?? this.config.detectionRange;
    }

    private get laneSpeedCoef(): number {
        return this.lane === Lane.Front ? 1 : 0.6;
    }

    private get healthBarYOffset(): number {
        return this.lane === Lane.Front ? -80 : -50;
    }

    // ------------------------------------------------------------------ //
    //  Lifecycle                                                           //
    // ------------------------------------------------------------------ //

    override onInitialize(engine: Engine): void {
        engine.currentScene.add(this.healthBar);
        this.playAnimation("Idle");
    }

    protected playAnimation(name: string): void {
        this.animComponent.play(name, this.graphics);
    }

    override onPreUpdate(_engine: Engine, elapsedMs: number): void {
        if (this.isDead) return;

        this.scaleElementsByLane();

        this.attackCooldown -= elapsedMs;
        this.previousActivity = this.activity;
        this.updateBehavior(elapsedMs);

        this.animComponent.flipHorizontal(this.lookDirection === HorizontalDirection.Left);
        this.healthBar.pos = vec(this.pos.x - 15, this.pos.y + this.healthBarYOffset);
    }

    protected updateBehavior(_elapsedMs: number): void {
        const previousActivity = this.activity;
        this.activity = this.selectActivity();

        if (this.activity !== previousActivity) {
            this.onEnterActivity(this.activity, previousActivity);
            this.playAnimation(this.GetActivityAnimation(this.activity));
            this.timeInCurrentActivity = 0;
        }

        this.timeInCurrentActivity += _elapsedMs;
        this.onUpdateActivity(this.activity);
    }

    protected onEnterActivity(_activity: UnitActivity, _from: UnitActivity): void { }
    protected onUpdateActivity(_activity: UnitActivity): void { }
    protected selectActivity(): UnitActivity { return "idle"; }

    protected GetActivityAnimation(activity: UnitActivity): string {
        return ACTIVITY_ANIMATION[activity] ?? "Idle";
    }

    protected scaleElementsByLane(): void {
        const backY = GetYLevel(Lane.Back);
        const frontY = GetYLevel(Lane.Front);
        const currentY = this.pos.y;

        let percent = 1;
        if (this.lane === Lane.Back) {
            percent = currentY / backY;
            this.scale = GetScaleByLane(Lane.Back).scale(percent);
            this.healthBar.scale = GetHealthBarScaleByLane(Lane.Back).scale(percent);
        } else {
            percent = currentY / frontY;
            this.scale = GetScaleByLane(Lane.Front).scale(percent);
            this.healthBar.scale = GetHealthBarScaleByLane(Lane.Front).scale(percent);
        }
    }

    // ------------------------------------------------------------------ //
    //  Movement helpers                                                    //
    // ------------------------------------------------------------------ //

    moveTo(destination: Vector): void {
        if (this.isDead) return;
        this.orderedDestination = destination;
    }

    protected moveTowardDestination(): void {
        const dist = this.pos.distance(this.orderedDestination);
        if (dist < 5) {
            this.vel = Vector.Zero;
            return;
        }
        this.setVelocityToward(this.orderedDestination.sub(this.pos));
    }

    protected moveTowardEnemy(enemy: ICombatant): void {
        const toEnemy = enemy.globalPos.sub(this.pos);
        const stopAt = toEnemy.magnitude - this.effectiveAttackRange * 0.85;
        if (stopAt <= 0) {
            this.vel = Vector.Zero;
            return;
        }
        this.setVelocityToward(toEnemy);
    }

    private setVelocityToward(direction: Vector): void {
        this.vel = direction.normalize().scale(this.config.speed * this.laneSpeedCoef);
        this.lookDirection = this.vel.x > 0 ? HorizontalDirection.Right : HorizontalDirection.Left;
    }

    // ------------------------------------------------------------------ //
    //  Combat helpers                                                      //
    // ------------------------------------------------------------------ //

    protected findBestEnemy(): ICombatant | null {
        let best: ICombatant | null = null;
        let bestScore = -Infinity;

        for (const c of this.allCombatants) {
            if (!this.isHostile(c) || c.isDead || c.lane !== this.lane) continue;

            const d = c.globalPos.distance(this.pos);
            if (d > this.config.detectionRange) continue;

            const score = this.scoreTarget(c, d);
            if (score > bestScore) {
                best = c;
                bestScore = score;
            }
        }

        return best;
    }

    private scoreTarget(c: ICombatant, distance: number): number {
        // Normalise distance to [0, 1] where 1 = right next to us
        const proximityScore = 1 - (distance / this.config.detectionRange);

        // attackPriority is already a plain number, use it as-is
        const priorityScore = c.attackPriority;

        // Tune these weights to taste
        const PRIORITY_WEIGHT = 1.0;
        const PROXIMITY_WEIGHT = 2.0;

        return (priorityScore * PRIORITY_WEIGHT) + (proximityScore * PROXIMITY_WEIGHT);
    }

    protected isInAttackRange(target: ICombatant): boolean {
        return target.globalPos.distance(this.pos) < this.effectiveAttackRange;
    }

    performAttack(target: ICombatant): void {
        if (this.config.attackType === AttackType.Melee) {
            target.takeDamage(this.config.attackDamage, this.lookDirection);
        } else {
            const dir = target.globalPos.sub(this.pos).normalize();
            this.scene?.add(new Bullet(this.pos.add(vec(10, this.lane === Lane.Front ? -40 : -20)), dir, this.allCombatants, this.config.faction, this.config.attackDamage, this.lane));
        }
    }

    takeDamage(damage: number, hitDirection: HorizontalDirection): void {
        if (this.isDead) return;
        this.health -= damage;
        this.healthBar.setValue(this.health);
        if (this.health <= 0) {
            this.isDead = true;
            this.cleanUpOnDeath();
            this.actions.fade(0, 500).callMethod(() => { this.kill(); });
        } else {
            this.actions.blink(100, 50, 1);
        }
    }

    cleanUpOnDeath(): void {
        this.healthBar.kill()
    }

    setTint(color: Color): void { this.animComponent.setTint(color); }

    // ------------------------------------------------------------------ //
    //  Misc                                                                //
    // ------------------------------------------------------------------ //


    isHostile(other: ICombatant): boolean {
        return other.faction !== this.faction;
    }

    changeLane(targetX: number): void {
        this.lane = this.lane === Lane.Front ? Lane.Back : Lane.Front;
        this.orderedDestination = vec(targetX, GetYLevel(this.lane));

        if (this.groupRef !== null && this.groupRef.leader.id === this.id) {
            this.groupRef.followers.forEach(follower => follower.changeLane(targetX));
        }
    }

    joinGroup(group: Group): void { this.groupRef = group; }
    leaveGroup(): void { this.groupRef = null; }

    onRoleInGroupChanged(): void {
    }

    override onPostKill(): void {
        this.emit('died', this);
    }

    override onPostUpdate(_engine: Engine, _elapsedMs: number): void {
        Debug.drawCircle(this.pos, this.config.detectionRange, { color: Color.Transparent, strokeColor: Color.Green, width: 1 });
        Debug.drawCircle(this.pos, this.effectiveAttackRange, { color: Color.Transparent, strokeColor: Color.Red, width: 1 });
        Debug.drawText(this.activity, this.pos.add(vec(0, -50)));
    }
}