import { MapManager } from "../mapManager";
import { MapNode } from "../mapNode";
import { TurnManager, TurnController } from "../turnManager";

export class EnemyTurnController implements TurnController {
    public selectedMapNode: MapNode | null = null
    private endTurn: (() => void) | null = null;

    constructor(
        private readonly turnManager: TurnManager,
        private readonly mapManager: MapManager
    ) {
    }

    beginTurn(endTurn: () => void): void {
        this.endTurn = endTurn

        const enemyMapPawns = this.mapManager.getEnemyPawns()

        for (const pawn of enemyMapPawns) {
            const pawnNode = this.mapManager.getPawnNode(pawn)
            if (pawnNode === undefined) continue
            const neighbours = this.mapManager.getNeigbours(pawnNode)
            this.mapManager.planPawnMove(pawn, neighbours[0])
        }

        setTimeout(() => {
            endTurn()
        }, (300));
    }
}