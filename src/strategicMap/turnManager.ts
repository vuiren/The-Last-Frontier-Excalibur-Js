import { EventEmitter, vec } from "excalibur";
import { Ownership, Turn } from "../constants";
import { PlayerTurnController } from "./controllers/playerTurnController";
import { MapManager } from "./mapManager";
import { EnemyTurnController } from "./controllers/enemyTurnController";
import { FightTurnController } from "./controllers/fightTurnController";
import { MapNode } from "./mapNode";
import { MapPawn } from "./mapPawn";
import { MapEntitiesSpawner } from "./mapEntitiesSpawner";

export interface TurnEndPayload {
    previousTurn: Turn;
    currentTurn: Turn;
}

export interface TurnController {
    beginTurn(endTurn: () => void): void,
}


export class TurnManager {
    public customEvents = new EventEmitter<{
        turnChanged: TurnEndPayload;
    }>();

    currentTurn: Turn
    private contestedNodes: MapNode[] = []

    private readonly mapManager: MapManager
    private readonly entitiesSpawner: MapEntitiesSpawner
    private readonly playerTurnController: PlayerTurnController;
    private readonly enemyTurnController: EnemyTurnController;
    private readonly fightTurnController: FightTurnController;
    private readonly turnController: Record<Turn, TurnController>
    private readonly defaultMapNodeOffset = vec(0, -45)
    private readonly selectedOffset = vec(0, -15)
    private readonly pawnSpacing = 30 // horizontal gap between pawns on one node, tune to your sprite width

    constructor(currentTurn: Turn, mapManager: MapManager, entitiesSpawner: MapEntitiesSpawner) {
        this.currentTurn = currentTurn
        this.mapManager = mapManager
        this.entitiesSpawner = entitiesSpawner
        this.playerTurnController = new PlayerTurnController(this, this.mapManager)
        this.enemyTurnController = new EnemyTurnController(this, this.mapManager)
        this.fightTurnController = new FightTurnController(this, this.entitiesSpawner, this.mapManager)

        this.mapManager.customEvents.on('pawnMovePlanned', ({ pawn }) => this.positionPawn(pawn))
        this.mapManager.customEvents.on('pawnMoveCancelled', ({ pawn }) => this.positionPawn(pawn))

        this.turnController = {
            [Turn.Player]: this.playerTurnController,
            [Turn.Enemy]: this.enemyTurnController,
            [Turn.Fight]: this.fightTurnController,
        };
    }

    startTurn() {
        const controller = this.turnController[this.currentTurn]
        controller.beginTurn(() => { this.endTurnCallback(this) })
    }

    endTurnCallback(turnManager: TurnManager) {
        turnManager.resolveTurn()
    }

    getNextTurn() {
        if (this.contestedNodes.length > 0) {
            return Turn.Fight
        }
        return this.currentTurn === Turn.Player ? Turn.Enemy : Turn.Player
    }

    resolveTurn() {
        this.mapManager.movePawns()
        this.recalculateMapState()
        this.positionAllPawns()
        const previousTurn = this.currentTurn
        const nextTurn = this.getNextTurn()
        this.currentTurn = nextTurn
        this.customEvents.emit('turnChanged', { previousTurn: previousTurn, currentTurn: nextTurn })

        this.startTurn()
    }

    positionAllPawns() {
        for (const node of this.mapManager.mapNodes) {
            this.positionPawnsAt(node)
        }
        this.mapManager.getPawnsOnTheMove().forEach(p => this.positionWalkingPawn(p))
    }

    positionPawn(pawn: MapPawn) {
        if (pawn.getTargetNode()) {
            this.positionWalkingPawn(pawn)
        }
        // Re-spread whoever is still standing on the owner node
        this.positionPawnsAt(pawn.getOwnerNode())
    }

    private positionPawnsAt(node: MapNode) {
        // getPawnsAt already excludes walkers, so only standing pawns are here
        const standing = this.mapManager.getPawnsAt(node)
            .sort((a, b) => this.factionOrder(a) - this.factionOrder(b))

        const basePos = node.pos.add(this.defaultMapNodeOffset)
        const count = standing.length

        standing.forEach((pawn, i) => {
            const xOffset = (i - (count - 1) / 2) * this.pawnSpacing
            const slotPos = basePos.add(vec(xOffset, 0))
            pawn.pos = pawn.selected ? slotPos.add(this.selectedOffset) : slotPos
        })
    }

    private positionWalkingPawn(pawn: MapPawn) {
        const targetNode = pawn.getTargetNode()!
        const middlePoint = pawn.getOwnerNode().pos.add(targetNode.pos).scale(0.5)
        pawn.pos = middlePoint.add(this.selectedOffset)
    }

    private factionOrder(pawn: MapPawn) {
        return pawn.faction === Ownership.Player ? 0 : 1
    }

    getContestedNodes() {
        return this.contestedNodes
    }

    recalculateMapState() {
        const contestedNodes = []

        const nodes = this.mapManager.mapNodes
        for (const node of nodes) {
            const allPawns = this.mapManager.getPawnsAt(node)
            const playerPawns = allPawns.filter(x => x.faction === Ownership.Player)
            const enemyPawns = allPawns.filter(x => x.faction === Ownership.Enemy)
            if (playerPawns.length > 0 && enemyPawns.length > 0) {
                node.changeOwnership(Ownership.Contested)
                contestedNodes.push(node)
                playerPawns.forEach(x => x.inFight = true)
                enemyPawns.forEach(x => x.inFight = false)
            }

            if (enemyPawns.length > 0 && playerPawns.length === 0) {
                node.changeOwnership(Ownership.Enemy)
            }

            if (playerPawns.length > 0 && enemyPawns.length === 0) {
                node.changeOwnership(Ownership.Player)
            }
        }

        this.contestedNodes = contestedNodes
    }

    endPlayerTurn() {
        if (this.currentTurn !== Turn.Player) return

        this.endTurnCallback(this)
    }
}