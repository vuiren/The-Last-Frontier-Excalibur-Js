import { Actor, Vector, Animation, vec, Engine, Debug, Color, GraphicsComponent } from "excalibur";
import { Bullet } from "./bullet";
import { Lane, FrontGroundYLevel, BackGroundYLevel, Direction, AttackType } from "./constants";
import { Group } from "./group";
import { HealthBar } from "./healthBar";
import { Resources } from "./resources";
import { UnitConfig } from "./unitConfigs";
import { AnimComponent } from "./animComponent";

export type UnitActivity = "idle" | "moving" | "chasing" | "attacking" | "dead" | "movingAndAttacking";

export class Unit extends Actor {
    allUnits: Unit[];
    health: number;
    lane: Lane;
    groupRef: Group | null = null;
    lookDirection: Direction = Direction.Right;
    config: UnitConfig;
    orderedDestination: Vector;
    attackCooldown: number = 0;
    isDead: boolean = false;
    activity: UnitActivity = "idle";
    previousActivity: UnitActivity = "idle";

    private healthBar: HealthBar;
    private animComponent;

    constructor(startPosition: Vector, config: UnitConfig, allUnits: Unit[], startLane = Lane.Front) {
        super({ name: 'Unit', pos: startPosition, width: 16, height: 16 });
        this.config = config;
        this.allUnits = allUnits;
        this.orderedDestination = startPosition;
        this.lane = startLane;
        this.health = config.health;
        this.healthBar = new HealthBar(vec(0, 0), 50, 6, config.health);
        this.scale = vec(4, 4);
        this.animComponent = new AnimComponent(config.graphicSource);
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

        this.animComponent.flipHorizontal(this.lookDirection === Direction.Left);
        this.healthBar.pos = vec(this.pos.x - 25, this.pos.y - 28);
    }

    protected updateBehavior(_elapsedMs: number): void {
        const previousActivity = this.activity;
        this.activity = this.selectActivity();

        if (this.activity !== previousActivity) {
            this.onEnterActivity(this.activity, previousActivity);
            this.playAnimation(this.GetActivityAnimation(this.activity));
        }

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
        this.vel = this.orderedDestination.sub(this.pos).normalize().scale(this.config.speed);
        this.lookDirection = this.vel.x > 0 ? Direction.Right : Direction.Left;
    }

    protected moveTowardEnemy(enemy: Unit): void {
        const toEnemy = enemy.pos.sub(this.pos);
        const range = this.config.attackRange ?? this.config.detectionRange;

        const stopAt = toEnemy.magnitude - range * 0.85;
        if (stopAt <= 0) {
            this.vel = Vector.Zero;
            return;
        }

        this.vel = toEnemy.normalize().scale(this.config.speed);
        this.lookDirection = this.vel.x > 0 ? Direction.Right : Direction.Left;
    }

    // ------------------------------------------------------------------ //
    //  Combat helpers                                                      //
    // ------------------------------------------------------------------ //

    protected findClosestEnemy(): Unit | null {
        let closest: Unit | null = null;
        let closestDist = this.config.detectionRange;

        for (const other of this.allUnits) {
            if (!this.isHostile(other) || other.isDead) continue;
            const d = other.pos.distance(this.pos);
            if (d < closestDist) { closestDist = d; closest = other; }
        }
        return closest;
    }

    protected isInAttackRange(target: Unit): boolean {
        const range = this.config.attackRange ?? this.config.detectionRange;
        return target.pos.distance(this.pos) < range;
    }

    performAttack(target: Unit): void {
        if (this.config.attackType === AttackType.Melee) {
            target.takeDamage(this.config.attackDamage, this.lookDirection);
        } else {
            const dir = target.pos.sub(this.pos).normalize();
            this.scene?.add(new Bullet(this.pos, dir, false, this.allUnits, this.config.faction, this.config.attackDamage));
        }
    }

    takeDamage(damage: number, hitDirection: Direction): void {
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

    isHostile(other: Unit): boolean {
        return other.config.faction !== this.config.faction;
    }

    getYLevel(): number {
        return this.lane === Lane.Front ? FrontGroundYLevel : BackGroundYLevel;
    }

    changeLane(): void {
        this.lane = this.lane === Lane.Front ? Lane.Back : Lane.Front;
        this.pos = vec(this.pos.x, this.getYLevel());
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