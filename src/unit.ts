import { Actor, Vector, Sprite, vec, Engine, Debug, Color } from "excalibur";
import { Bullet } from "./bullet";
import { Lane, FrontGroundYLevel, BackGroundYLevel, Direction, AttackType } from "./constants";
import { Group } from "./group";
import { HealthBar } from "./healthBar";
import { Resources } from "./resources";
import { UnitConfig } from "./unitConfigs";

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

    protected sprite!: Sprite;
    private healthBar: HealthBar;

    constructor(startPosition: Vector, config: UnitConfig, allUnits: Unit[], startLane = Lane.Front) {
        super({ name: 'Unit', pos: startPosition, width: 100, height: 100 });
        this.config = config;
        this.allUnits = allUnits;
        this.orderedDestination = startPosition;
        this.lane = startLane;
        this.health = config.health;
        this.healthBar = new HealthBar(vec(0, 0), 50, 6, config.health);
    }

    override onInitialize(engine: Engine): void {
        this.sprite = Resources.Sword.toSprite();
        this.graphics.use(this.sprite);
        engine.currentScene.add(this.healthBar);
    }

    override onPreUpdate(_engine: Engine, elapsedMs: number): void {
        if (this.isDead) return;

        this.attackCooldown -= elapsedMs;
        this.previousActivity = this.activity;
        this.updateBehavior(elapsedMs);

        this.sprite.flipHorizontal = this.lookDirection === Direction.Left;
        this.healthBar.pos = vec(this.pos.x - 25, this.pos.y - 28);
    }

    /**
     * Override in subclasses to define unit-specific AI or player logic.
     * Default behavior: move toward orderedDestination.
     */
    protected updateBehavior(_elapsedMs: number): void {

    }

    protected selectActivity(): UnitActivity {
        return "idle";
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

        // Stop just inside attack range to avoid jitter at the edge.
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