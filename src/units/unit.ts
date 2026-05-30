import { Actor, Vector, vec, Engine, Debug, Color } from "excalibur";
import { AnimComponent } from "../animComponent";
import { Bullet } from "../bullet";
import { ICombatant, IGroupable } from "../combatant";
import { Lane, Faction, AttackType, HorizontalDirection, GetYLevel, GetScaleByLane } from "../constants";
import { Group } from "../group";
import { HealthBar } from "../healthBar";
import { UnitConfig } from "../unitConfigs";

export type UnitActivity = "idle" | "moving" | "chasing" | "attacking" | "dead" | "movingAndAttacking";

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

    private healthBar: HealthBar;
    private animComponent;

    constructor(startPosition: Vector, config: UnitConfig, allCombatants: ICombatant[], startLane = Lane.Front) {
        startPosition = vec(startPosition.x, GetYLevel(startLane));
        super({ name: 'Unit', pos: startPosition, width: 16, height: 16, anchor: vec(0.5, 1) });
        this.config = config;
        this.allCombatants = allCombatants;
        this.orderedDestination = startPosition;
        this.lane = startLane;
        this.health = config.health;
        this.faction = config.faction;
        this.healthBar = new HealthBar(vec(0, 0), 50, 6, config.health);
        this.scale = GetScaleByLane(startLane);
        this.animComponent = new AnimComponent(config.graphicSource);
        this.healthBar.scale = this.lane === Lane.Front ? vec(1, 1) : vec(0.75, 0.75);
    }

    override onInitialize(engine: Engine): void {
        engine.currentScene.add(this.healthBar);
        this.playAnimation("Idle");
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
        this.healthBar.pos = vec(this.pos.x - 25, this.lane === Lane.Front ? this.pos.y - 80 : this.pos.y - 50);
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

    protected onEnterActivity(activity: UnitActivity, _from: UnitActivity): void {
    }

    protected onUpdateActivity(activity: UnitActivity): void {
    }

    protected selectActivity(): UnitActivity {
        return "idle";
    }

    protected GetActivityAnimation(activity: UnitActivity): string {
        switch (activity) {
            case "idle":
                return "Idle";
            case "moving":
                return "Walking";
            case "attacking":
                return "Shooting";
            case "movingAndAttacking":
                return "RunNShoot";
        }

        return "Idle";
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
        const laneCoef = this.lane === Lane.Front ? 1 : 0.75;
        this.vel = this.orderedDestination.sub(this.pos).normalize().scale(this.config.speed * laneCoef);
        this.lookDirection = this.vel.x > 0 ? HorizontalDirection.Right : HorizontalDirection.Left;
    }

    protected moveTowardEnemy(enemy: ICombatant): void {
        const toEnemy = enemy.globalPos.sub(this.pos);
        const range = this.config.attackRange ?? this.config.detectionRange;

        const stopAt = toEnemy.magnitude - range * 0.85;
        if (stopAt <= 0) {
            this.vel = Vector.Zero;
            return;
        }

        const laneCoef = this.lane === Lane.Front ? 1 : 0.75;
        this.vel = toEnemy.normalize().scale(this.config.speed * laneCoef);
        this.lookDirection = this.vel.x > 0 ? HorizontalDirection.Right : HorizontalDirection.Left;
    }

    // ------------------------------------------------------------------ //
    //  Combat helpers                                                      //
    // ------------------------------------------------------------------ //

    protected findClosestEnemy(): ICombatant | null {
        let closest: ICombatant | null = null;
        let closestDist = this.config.detectionRange;

        for (const c of this.allCombatants) {
            if (!this.isHostile(c) || c.isDead || c.lane !== this.lane) continue;

            const d = c.globalPos.distance(this.pos);
            if (d < closestDist) {
                closest = c;
                closestDist = d;
            }
        }

        return closest;
    }

    protected isInAttackRange(target: ICombatant): boolean {
        const range = this.config.attackRange ?? this.config.detectionRange;
        return target.globalPos.distance(this.pos) < range;
    }

    performAttack(target: ICombatant): void {
        if (this.config.attackType === AttackType.Melee) {
            target.takeDamage(this.config.attackDamage, this.lookDirection);
        } else {
            const dir = target.globalPos.sub(this.pos).normalize();
            this.scene?.add(new Bullet(this.pos.add(vec(10, -40)), dir, this.allCombatants, this.config.faction, this.config.attackDamage, this.lane));
        }
    }

    takeDamage(damage: number, hitDirection: HorizontalDirection): void {
        if (this.isDead) return;
        this.health -= damage;
        this.healthBar.setHealth(this.health);
        if (this.health <= 0) {
            this.isDead = true;
            this.healthBar.kill();
            this.kill();
        }
    }

    setTint(color: Color): void {
        this.animComponent.setTint(color);
    }

    clearTint(): void {
        this.animComponent.clearTint();
    }

    // ------------------------------------------------------------------ //
    //  Misc                                                                //
    // ------------------------------------------------------------------ //

    isHostile(other: ICombatant): boolean {
        return other.faction !== this.faction;
    }


    changeLane(): void {
        this.lane = this.lane === Lane.Front ? Lane.Back : Lane.Front;
        this.pos = vec(this.pos.x, GetYLevel(this.lane));
    }

    joinGroup(group: Group): void { this.groupRef = group; }
    leaveGroup(): void { this.groupRef = null; }

    override onPostKill(): void {
        this.emit('died', this);
    }

    override onPostUpdate(_engine: Engine, _elapsedMs: number): void {
        const range = this.config.attackRange ?? this.config.detectionRange;
        Debug.drawCircle(this.pos, this.config.detectionRange, { color: Color.Transparent, strokeColor: Color.Green, width: 1 });
        Debug.drawCircle(this.pos, range, { color: Color.Transparent, strokeColor: Color.Red, width: 1 });
        Debug.drawText(this.activity, this.pos.add(vec(0, -50)));
    }
}