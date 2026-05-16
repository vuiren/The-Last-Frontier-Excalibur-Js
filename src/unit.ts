import { Actor, Vector, Sprite, vec, Engine, Debug, Color } from "excalibur";
import { Bullet } from "./bullet";
import { Lane, Faction, FrontGroundYLevel, BackGroundYLevel, Direction } from "./constants";
import { Group } from "./group";
import { HealthBar } from "./healthBar";
import { Resources } from "./resources";

export class Unit extends Actor {
    destination: Vector;
    speed = 250;
    detectionRange = 250;
    shootCoolDown = 500;
    remainingShootCoolDown = 0;
    nearby: Actor[] = [];
    allUnits: Unit[];
    health = 25;
    lane: Lane;
    isAttacking: boolean = false;
    attackTarget: Unit | null = null;
    groupRef: Group | null = null;
    isMoving: boolean = false;
    lookDirection: Direction = Direction.Right;
    faction: Faction = Faction.Player;
    protected sprite!: Sprite;
    private healthBar: HealthBar;

    constructor(startPosition: Vector, allUnits: Unit[], faction: Faction, startLane = Lane.Front, health: number) {
        super({ name: 'Unit', pos: startPosition, width: 100, height: 100 });
        this.allUnits = allUnits;
        this.destination = startPosition;
        this.lane = startLane;
        this.health = health;
        this.faction = faction;
        this.healthBar = new HealthBar(vec(0, 0), 50, 6, health);
    }

    override onInitialize(engine: Engine): void {
        this.sprite = Resources.Sword.toSprite();
        this.graphics.use(this.sprite);
        engine.currentScene.add(this.healthBar);
    }

    getYLevel() {
        return this.lane === Lane.Front ? FrontGroundYLevel : BackGroundYLevel;
    }

    changeLane() {
        this.lane = this.lane === Lane.Front ? Lane.Back : Lane.Front;
        this.pos = vec(this.pos.x, this.getYLevel());
    }

    override onPreUpdate(_engine: Engine, elapsedMs: number): void {
        this.movement();
        this.sprite.flipHorizontal = this.lookDirection === Direction.Left;
        this.healthBar.pos = vec(this.pos.x - 25, this.pos.y - 28);

        if (this.nearby.length > 0) {
            if (!this.isAttacking) this.emit("beganAttacking", this);
            this.isAttacking = true;
        } else {
            this.isAttacking = false;
        }

        this.remainingShootCoolDown -= elapsedMs;
        if (this.nearby.length > 0 && this.remainingShootCoolDown < 0) {
            const first = this.nearby[0];
            const shootDirection = first.pos.sub(this.pos).normalize();
            this.scene?.add(new Bullet(this.pos, shootDirection, false, this.allUnits));
            this.remainingShootCoolDown = this.shootCoolDown;
        }
    }

    private movement(): void {
        const distance = this.pos.distance(this.destination);
        if (distance < 5) {
            this.pos = this.destination;
            this.vel = Vector.Zero;
            this.isMoving = false;
            return;
        }
        this.isMoving = true;
        this.vel = this.destination.sub(this.pos).normalize().scale(this.speed);
        this.lookDirection = this.vel.x > 0 ? Direction.Right : Direction.Left;
    }

    takeDamage(damage: number, hitDirection: Vector) {
        this.health -= damage;
        this.healthBar.setHealth(this.health);
        if (this.health <= 0) {
            this.kill();
            this.healthBar.kill();
        }
    }

    lookForNearbyEnemies() {
        this.nearby = this.allUnits.filter(a =>
            a.pos.distance(this.pos) < this.detectionRange && this.isHostile(a)
        );
    }

    isHostile(otherUnit: Unit) {
        return otherUnit.faction !== this.faction;
    }

    override onPostKill() {
        this.emit('died', this);
    }

    override onPostUpdate(_engine: Engine, _elapsedMs: number): void {
        this.lookForNearbyEnemies();

        Debug.drawCircle(this.pos, this.detectionRange, {
            color: Color.Transparent,
            strokeColor: Color.Green,
            width: 1
        });

        for (const unit of this.nearby) {
            Debug.drawLine(this.pos, unit.pos, { color: Color.Green });
        }
    }
}