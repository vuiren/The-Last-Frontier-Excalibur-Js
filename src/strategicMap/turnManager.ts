import { EventEmitter } from "excalibur";
import { Ownership } from "../constants";
import { PlayerTurnController } from "./controllers/playerTurnController";
import { MapManager } from "./mapManager";
import { EnemyTurnController } from "./controllers/enemyTurnController";
import { NeutralTurnController } from "./controllers/neutralTurnController";

export interface TurnEndPayload {
    previousTurnOwner: Ownership;
    currentTurnOwner: Ownership;
}

export interface TurnController {
    beginTurn(endTurn: () => void): void,
}


export class TurnManager {
    public customEvents = new EventEmitter<{
        turnChanged: TurnEndPayload;
    }>();

    currentTurn: Ownership
    private readonly mapManager: MapManager
    private readonly playerTurnController: PlayerTurnController;
    private readonly enemyTurnController: EnemyTurnController;
    private readonly neutralTurnController: NeutralTurnController;

    ownershipController: Record<Ownership, TurnController>

    constructor(currentTurn: Ownership, mapManager: MapManager) {
        this.currentTurn = currentTurn
        this.mapManager = mapManager
        this.playerTurnController = new PlayerTurnController(this, this.mapManager)
        this.enemyTurnController = new EnemyTurnController(this, this.mapManager)
        this.neutralTurnController = new NeutralTurnController(this, this.mapManager)

        this.ownershipController = {
            [Ownership.Player]: this.playerTurnController,
            [Ownership.Enemy]: this.enemyTurnController,
            [Ownership.Neutral]: this.neutralTurnController
        };

        this.startTurn()
    }

    startTurn() {
        this.ownershipController[this.currentTurn].beginTurn(()=>{this.endTurnCallback(this)})
    }

    endTurnCallback(turnManager: TurnManager) {
        const previousTurnOwner = turnManager.currentTurn;
        turnManager.currentTurn = turnManager.getNextTurnOwner();
        turnManager.customEvents.emit('turnChanged', { previousTurnOwner: previousTurnOwner, currentTurnOwner: turnManager.currentTurn })

        turnManager.startTurn()
    }

    getNextTurnOwner() {
        return this.currentTurn === Ownership.Player ? Ownership.Enemy : Ownership.Player
    }

    endPlayerTurn() {
        if (this.currentTurn !== Ownership.Player) return
        this.endTurnCallback(this)
    }
}