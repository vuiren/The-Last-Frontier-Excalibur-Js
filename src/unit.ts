import { Actor, Color, Debug, Engine, PointerButton, Sprite, vec, Vector } from "excalibur";
import { Resources } from "./resources";
import { Bullet } from "./bullet";
import { spawnUnitMoveMarker } from "./spawnFunctions";
import { HealthBar } from "./healthBar";
import { Lane } from "./constants";

export class Unit extends Actor {
    isEnemy = false;
    destination: Vector;
    speed = 250;
    detectionRange = 250;
    shootCoolDown = 500;
    remainingShootCoolDown = 0;
    nearby: Actor[] = [];
    allUnits: Unit[];
    health = 25;
    isSelected = false
    lane: Lane;
    isAttacking: boolean;
    attackTarget: Unit | null = null;
    private onClick: (unit: Unit) => void;
    private onRightClick: (unit: Unit) => void;
    private sprite!: Sprite;
    private healthBar: HealthBar;

    constructor(startPosition: Vector, allUnits: Unit[], onClick: (unit: Unit) => void, onRightClick: (unit: Unit) => void,
        isEnemy: boolean, startLane = Lane.Front, health: number) {
        super({ name: 'Unit', pos: startPosition, width: 100, height: 100 });
        this.allUnits = allUnits;
        this.destination = startPosition;
        this.isEnemy = isEnemy
        this.onClick = onClick
        this.onRightClick = onRightClick
        this.lane = startLane
        this.isAttacking = false;
        this.health = health
        this.healthBar = new HealthBar(vec(0, 0), 50, 6, health);
    }

    override onInitialize(engine: Engine): void {
        this.sprite = Resources.Sword.toSprite();
        this.graphics.use(this.sprite);
        engine.currentScene.add(this.healthBar);
        this.pointer.useGraphicsBounds = true;
        this.on('pointerup', (evt) => {
            evt.cancel();

            if (evt.button === PointerButton.Left) {
                this.onClick(this);
            } else if (evt.button === PointerButton.Right) {
                this.onRightClick(this);
            }
        });

        if (!this.isEnemy)
            spawnUnitMoveMarker(engine.currentScene, this, this.pos)
    }

    select() {
        this.isSelected = true;
        this.sprite.tint = Color.Red;
    }

    deselect() {
        this.isSelected = false;
        this.sprite.tint = Color.White;
    }

    moveTo(destination: Vector) {
        this.destination = destination;
    }

    changeLane(newLane: Lane) {
        this.lane = newLane
    }

    override onPreUpdate(_engine: Engine, elapsedMs: number): void {
        this.movement();
        this.healthBar.pos = vec(this.pos.x - 25, this.pos.y - 28);

        if (this.nearby.length > 0) {
            if (!this.isAttacking) {
                this.emit("beganAttacking", this)
            }
            this.isAttacking = true
        } else {
            this.isAttacking = false
        }

        this.remainingShootCoolDown -= elapsedMs;
        if (this.nearby.length > 0 && this.remainingShootCoolDown < 0) {
            const first = this.nearby[0]
            const shootDirection = first.pos.sub(this.pos).normalize()
            const bullet = new Bullet(this.pos, shootDirection, this.isEnemy, this.allUnits)
            this.scene?.add(bullet)
            this.remainingShootCoolDown = this.shootCoolDown
        }
    }

    private movement(): void {
        const distance = this.pos.distance(this.destination);
        if (distance < 5) {
            this.pos = this.destination;
            this.vel = Vector.Zero;
            return;
        }
        this.vel = this.destination.sub(this.pos).normalize().scale(this.speed);
    }

    takeDamage(damage: number) {
        console.log("Took damage")
        this.health -= damage;
        this.healthBar.setHealth(this.health)
        if (this.health <= 0) {
            this.kill()
            this.healthBar.kill()
        }
    }

    lookForNearbyEnemies() {
        this.nearby = this.allUnits.filter(a => {
            return this.isEnemy
                ? a.pos.distance(this.pos) < this.detectionRange && !a.isEnemy
                : a.pos.distance(this.pos) < this.detectionRange && a.isEnemy
            }
        )
    }

    override onPostKill() {
        this.emit('died', this)
    }

    override onPostUpdate(engine: Engine, elapsedMs: number): void {
        this.lookForNearbyEnemies()

        Debug.drawCircle(this.pos, this.detectionRange, {
            color: Color.Transparent,
            strokeColor: Color.Green,
            width: 1
        })

        for (const unit of this.nearby) {
            Debug.drawLine(this.pos, unit.pos, {
                color: Color.Green
            })
        }
    }
}
