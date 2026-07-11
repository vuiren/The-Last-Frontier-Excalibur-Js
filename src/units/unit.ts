import { Actor, Vector, vec, Engine, Debug, Color } from "excalibur";
import { AnimComponent } from "../animComponent";
import { Bullet } from "./bullet";
import { ICombatant, IGroupable } from "../combatant";
import { Group } from "../group";
import { ProgressBar } from "../progressBar";
import { UnitConfig } from "../unitConfigs";
import { queryNearby } from "../proximityQuery";
import { HorizontalDirection, Faction, FrontGroundYLevel, AttackType } from "../constants";

export type UnitActivity = "idle" | "greeting" | "moving" | "stunned" | "chasing" | "attacking" | "dead";

const ACTIVITY_ANIMATION: Partial<Record<UnitActivity, string>> = {
    idle: "Idle",
    greeting: "Greeting",
    moving: "Walking",
    stunned: "Walking",
    attacking: "Shooting",
};

export class Unit extends Actor implements ICombatant, IGroupable {
    health: number;
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
    isUnitHovered = false;
    tookDamageLastFrame = false;
    lastDamageDirection: HorizontalDirection | null = null;
    private healthBar: ProgressBar;
    private animComponent: AnimComponent;

    protected allCombatants: ICombatant[] = [];
    protected allGroupables: IGroupable[] = [];

    constructor(startX: number, config: UnitConfig, allCombatants: ICombatant[], allGroupables: IGroupable[]) {
        const startPosition = vec(startX, FrontGroundYLevel);
        super({ name: 'Unit', pos: startPosition, width: 16, height: 16, anchor: vec(0.5, 1), z: 3 });
        this.config = config;
        this.allCombatants = allCombatants;
        this.allGroupables = allGroupables;
        this.orderedDestination = startPosition;
        this.health = config.health;
        this.faction = config.faction;
        this.animComponent = new AnimComponent(config.graphicSource);

        this.healthBar = new ProgressBar(vec(-4, -20), 8, 2, config.health, config.health);
        this.addChild(this.healthBar)
    }

    // ------------------------------------------------------------------ //
    //  Getters                                                             //
    // ------------------------------------------------------------------ //

    protected get effectiveAttackRange(): number {
        return this.config.attackRange ?? this.config.detectionRange;
    }

    // ------------------------------------------------------------------ //
    //  Lifecycle                                                           //
    // ------------------------------------------------------------------ //

    override onInitialize(engine: Engine): void {
        this.playAnimation("Idle");

        this.on('pointerenter', () => {
            this.onPointerEnter();
        });
        this.on('pointerleave', () => {
            this.onPointerLeave();
        });
    }

    onPointerEnter() {
        this.isUnitHovered = true;
    }

    onPointerLeave() {
        this.isUnitHovered = false;
    }

    protected playAnimation(name: string): void {
        this.animComponent.play(name, this.graphics);
    }

    override onPreUpdate(_engine: Engine, elapsedMs: number): void {
        if (this.isDead) return;

        this.attackCooldown -= elapsedMs;
        this.previousActivity = this.activity;
        this.updateBehavior(elapsedMs);

        this.animComponent.flipHorizontal(this.lookDirection === HorizontalDirection.Left);
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
        this.vel = direction.normalize().scale(this.config.speed);
        this.lookDirection = this.vel.x > 0 ? HorizontalDirection.Right : HorizontalDirection.Left;
    }

    // ------------------------------------------------------------------ //
    //  Combat helpers                                                      //
    // ------------------------------------------------------------------ //

    protected findBestEnemy(): ICombatant | null {
        let best: ICombatant | null = null;
        let bestScore = -Infinity;

        const candidates = queryNearby(this.allCombatants, {
            origin: this.pos,
            radius: this.config.detectionRange,
            excludeSelf: this,
        }).filter(c => this.isHostile(c) && !c.isDead);

        for (const c of candidates) {
            const d = c.globalPos.distance(this.pos);
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
            this.scene?.add(new Bullet(this.pos.add(vec(this.lookDirection === HorizontalDirection.Right ? 10 : -10, -8)), dir, this.allCombatants, this.config.faction, this.config.attackDamage));
        }
    }

    takeDamage(damage: number, hitDirection: HorizontalDirection): void {
        if (this.isDead) return;
        this.tookDamageLastFrame = true;
        this.lastDamageDirection = hitDirection;
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
    }

    setTint(color: Color): void { this.animComponent.setTint(color); }

    // ------------------------------------------------------------------ //
    //  Misc                                                                //
    // ------------------------------------------------------------------ //


    isHostile(other: ICombatant): boolean {
        return other.faction !== this.faction;
    }

    joinGroup(group: Group): void { this.groupRef = group; }
    leaveGroup(): void { this.groupRef = null; }

    onRoleInGroupChanged(): void {
    }

    override onPostUpdate(_engine: Engine, _elapsedMs: number): void {
        if (!import.meta.env.DEV) return; // Skip debug drawing in production

        const sign = this.lookDirection == HorizontalDirection.Right ? 1 : -1;
        Debug.drawLine(this.pos.add(vec(0, -8)), this.pos.add(vec(sign * this.config.detectionRange, -8)), { color: Color.Yellow });
        Debug.drawLine(this.pos.add(vec(0, -4)), this.pos.add(vec(sign * this.config.detectionRange, -4)), { color: Color.Red });
        Debug.drawText(this.activity, this.pos);
    }
}