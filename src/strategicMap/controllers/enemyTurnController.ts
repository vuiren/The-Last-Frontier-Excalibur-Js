import { MapManager } from "../mapManager";
import { MapNode } from "../mapNode";
import { TurnManager, TurnController } from "../turnManager";

export class EnemyTurnController implements TurnController {
    public selectedMapNode: MapNode | null = null
    private endTurn : (() => void) | null = null;

    constructor(
        private readonly turnManager: TurnManager,
        private readonly mapManager: MapManager
    ) {
    }

    beginTurn(endTurn: () => void): void {
        this.endTurn = endTurn
        setTimeout(() => {
            endTurn()
        }, (300));
    }
}