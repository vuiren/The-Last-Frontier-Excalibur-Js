import { MapEntitiesSpawner } from "../mapEntitiesSpawner";
import { MapManager } from "../mapManager";
import { MapNode } from "../mapNode";
import { MapPawn } from "../mapPawn";
import { TurnManager, TurnController } from "../turnManager";

export class FightTurnController implements TurnController {
    public selectedMapNode: MapNode | null = null

    private selectedPawns: MapPawn[] = []
    private endTurn: (() => void) | null = null;

    constructor(
        private readonly turnManager: TurnManager,
        private readonly entitiesSpawner: MapEntitiesSpawner,
        private readonly mapManager: MapManager
    ) {
    }

    beginTurn(endTurn: () => void): void {
        this.endTurn = endTurn

        const contestedNodes = this.turnManager.getContestedNodes()
        if (contestedNodes.length === 0) {
            endTurn()
            return
        }

        contestedNodes.forEach(element => {
            this.entitiesSpawner.createStartFightButton(element)
        });
    }
}