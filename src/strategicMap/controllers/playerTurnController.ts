import { MapManager } from "../mapManager";
import { MapNode } from "../mapNode";
import { TurnManager, TurnController } from "../turnManager";

export class PlayerTurnController implements TurnController {
    public selectedMapNode: MapNode | null = null

    private lastSelectedPawnIndex = 0
    private endTurn: (() => void) | null = null;

    constructor(
        private readonly turnManager: TurnManager,
        private readonly mapManager: MapManager
    ) {
        mapManager.customEvents.on('nodeClicked', x => (this.selectStartNode(x.mapNode)))
    }

    beginTurn(endTurn: () => void): void {
        this.endTurn = endTurn
    }

    private selectStartNode(mapNode: MapNode) {
        const newNodePawns = [...this.mapManager.getPawnsAt(mapNode)]

        if (mapNode === this.selectedMapNode) {
            if (newNodePawns.length + 1 >= this.lastSelectedPawnIndex) return
            this.lastSelectedPawnIndex++;
            newNodePawns[this.lastSelectedPawnIndex].selected = true
            return;
        } else {
            if(this.lastSelectedPawnIndex)
            if (this.selectedMapNode != null) {
                const selectedNodePawns = [...this.mapManager.getPawnsAt(this.selectedMapNode)]
                selectedNodePawns.forEach(x => {
                    x.selected = false;
                })
            }

            this.clearSelection()

            this.selectedMapNode = mapNode;
            mapNode.selected = true;

            if (newNodePawns.length > 0) {
                newNodePawns[this.lastSelectedPawnIndex].selected = true
            }
        }
    }

    private clearSelection() {
        if (this.selectedMapNode) this.selectedMapNode.selected = false;
        this.selectedMapNode = null;
    }
}