import { Engine, Scene, vec, PointerEvent, PointerButton } from "excalibur";
import { Spawner } from "./spawner";
import { GroupsManager } from "./groupsManager";
import { Group } from "./group";
import { Faction, FrontGroundYLevel, Lane } from "./constants";
import { UnitsManager } from "./unitsManager";
import { ICombatant, IGroupable } from "./combatant";
import { BuildingsManager } from "./buildingsManager";
import { PlayerUnit } from "./units/playerUnit";
import { Bridge } from "./buildings/bridge";
import { drawDottedLine } from "./drawDottedLine";

export class MyLevel extends Scene {
    allGroupables: IGroupable[] = [];
    allCombatants: ICombatant[] = [];
    allSpawners: Spawner[] = [];

    unitsManager: UnitsManager;
    buildingsManager: BuildingsManager;
    groupsManager: GroupsManager = new GroupsManager();
    selectedUnit: ICombatant | null = null;
    playerGroup: Group | null = null;
    private dashOffset = 0;
    private dashLen = 6;
    private gapLen = 4;

    constructor() {
        super();
        this.unitsManager = new UnitsManager(this.allCombatants, this.allGroupables);
        this.buildingsManager = new BuildingsManager(this.allCombatants);
    }

    override onInitialize(engine: Engine): void {

        this.unitsManager.spawnPlayerUnit(this, vec(200, FrontGroundYLevel), "playerSoldier", Lane.Front, this.unitSelection, this.unitRightClick)
        this.unitsManager.spawnPlayerUnit(this, vec(250, FrontGroundYLevel), "playerSoldier", Lane.Front, this.unitSelection, this.unitRightClick)
        this.unitsManager.spawnPlayerUnit(this, vec(150, FrontGroundYLevel), "playerSoldier", Lane.Front, this.unitSelection, this.unitRightClick)
        this.unitsManager.spawnPlayerUnit(this, vec(300, FrontGroundYLevel), "playerSoldier", Lane.Back, this.unitSelection, this.unitRightClick)
        this.unitsManager.spawnEnemyUnit(this, vec(600, FrontGroundYLevel), "enemyZombie", Lane.Front)
        this.unitsManager.spawnEnemyUnit(this, vec(650, FrontGroundYLevel), "enemyZombie", Lane.Front)
        this.unitsManager.spawnEnemyUnit(this, vec(700, FrontGroundYLevel), "enemyZombie", Lane.Front)
        this.unitsManager.spawnEnemyUnit(this, vec(650, FrontGroundYLevel), "enemyZombie", Lane.Back)

        this.buildingsManager.spawnPlayerBase(this, vec(100, FrontGroundYLevel), Faction.Player, Lane.Front)
        this.buildingsManager.spawnPlayerBase(this, vec(100, FrontGroundYLevel), Faction.Player, Lane.Back)

        const bridge = new Bridge(vec(300, 420))
        this.add(bridge);

        engine.input.pointers.primary.on('down', e => this.onMouseDown(e))
    }

    override onPreUpdate(engine: Engine, elapsed: number): void {
        const collisionsManager = this.unitsManager.collisionManager;
        collisionsManager.checkCollisions()
        const processedUnits: Set<ICombatant> = new Set();
        collisionsManager.collidingUnits.forEach((collidingWith, unit) => {
            if (collidingWith.length == 0) return
            if (processedUnits.has(unit)) return;

            let group: Group | undefined = undefined
            if (unit.groupRef !== null) {
                group = unit.groupRef
            } else {
                group = this.groupsManager.createGroup(unit)
            }
            collidingWith.forEach(x => {
                if (x.groupRef !== null) return;
                processedUnits.add(x)
                if (group !== undefined) {
                    this.groupsManager.addToGroup(x, group)
                    console.log(x + " added to group " + group)
                }
            })
            console.log(`${unit.id} colliding with ${collidingWith.map(u => u.id).join(', ')}`);

        });

        this.groupsManager.update()
    }

    onPostUpdate(engine: ex.Engine, delta: number) {
        this.dashOffset = (this.dashOffset + delta * 0.04) % (this.dashLen + this.gapLen);
    }

    onPreDraw(ctx: ex.ExcaliburGraphicsContext) {
        for (const group of this.groupsManager.groups) {
            for (let i = 0; i < group.members.length - 1; i++) {
                const fromScreen = this.engine.worldToScreenCoordinates(group.members[i].globalPos);
                const toScreen = this.engine.worldToScreenCoordinates(group.members[i + 1].globalPos);

                drawDottedLine(ctx, this.dashOffset, fromScreen, toScreen, undefined, this.dashLen, this.gapLen);
            }
        }
    }

    onMouseDown(e: PointerEvent) {
        if (e.button === PointerButton.Right) {
            const selected = this.allCombatants.filter(x => x.faction === Faction.Player && x instanceof PlayerUnit && x.isSelected)
            selected.forEach(x => {
                x.changeLane()
            })
        }
    }

    unitSelection(unit: ICombatant) {
        if (!(unit instanceof PlayerUnit)) return
        unit.isSelected = !unit.isSelected;
        if (unit.isSelected) {
            unit.select();
        } else {
            unit.deselect()
        }
    }

    unitRightClick(unit: ICombatant) {
        if (unit.lane === Lane.Front)
            unit.changeLane()
        else
            unit.changeLane()
    }
}