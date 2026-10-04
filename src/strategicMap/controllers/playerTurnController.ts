import { Turn } from "../../constants";
import { MapManager } from "../mapManager";
import { MapNode } from "../mapNode";
import { MapPawn } from "../mapPawn";
import { TurnManager, TurnController } from "../turnManager";

export class PlayerTurnController implements TurnController {
    public selectedMapNode: MapNode | null = null

    private selectedPawns: MapPawn[] = []
    private endTurn: (() => void) | null = null;

    constructor(
        private readonly turnManager: TurnManager,
        private readonly mapManager: MapManager
    ) {
        mapManager.customEvents.on('nodeClicked', x => {
            if (this.turnManager.currentTurn !== Turn.Player) return

            this.selectStartNode(x.mapNode)
        })
    }

    beginTurn(endTurn: () => void): void {
        this.endTurn = endTurn
    }

    private selectStartNode(mapNode: MapNode) {
        const newNodePawns = [...this.mapManager.getPawnsAt(mapNode)]

        if (mapNode === this.selectedMapNode) {
            if (newNodePawns.length === this.selectedPawns.length) return
            const nextPawn = newNodePawns[this.selectedPawns.length]
            nextPawn.selected = true
            this.turnManager.positionPawn(nextPawn)
            this.selectedPawns.push(nextPawn)
        } else {
            const neighbourClicked = this.selectedMapNode !== null && this.mapManager.areNeighbours(this.selectedMapNode, mapNode)

            this.selectedPawns.forEach(x => {
                if (neighbourClicked)
                    this.mapManager.planPawnMove(x, mapNode)
                x.selected = false;
                this.turnManager.positionPawn(x)
            })

            this.clearSelection()

            this.selectedPawns.length = 0

            if (!neighbourClicked) {
                this.selectedMapNode = mapNode;
                mapNode.selected = true;

                if (newNodePawns.length > 0) {
                    this.selectedPawns.push(newNodePawns[0])
                    newNodePawns[0].selected = true
                    this.turnManager.positionPawn(newNodePawns[0])
                }
            }
        }
    }

    private clearSelection() {
        if (this.selectedMapNode) this.selectedMapNode.selected = false;
        this.selectedMapNode = null;
    }
}