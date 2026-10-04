import { CancelMoveButton } from "./cancelMoveButton";
import { NodeCountBadge } from "./nodeCountBadge";
import { MapManager } from "../mapManager";
import { MapNode } from "../mapNode";
import { MapPawn } from "../mapPawn";

export class MapHudLayer {
    
    private badges = new Map<MapNode, NodeCountBadge>();
    private cancelButtons = new Map<MapPawn, CancelMoveButton>();

    constructor(private manager: MapManager) {
        manager.customEvents.on("nodeOccupancyChanged", (e) =>
            this.getBadge(e.mapNode).setCount(e.pawns.size));

        manager.customEvents.on("pawnMovePlanned", (e) => {

        });

        manager.customEvents.on("pawnMoveCancelled", (e) => this.clearButton(e.pawn));
    }

    private getBadge(node: MapNode) {
        let badge = this.badges.get(node);
        if (!badge) {
            badge = new NodeCountBadge();
            node.addChild(badge);
            this.badges.set(node, badge);
        }
        return badge;
    }

    private clearButton(pawn: MapPawn) {
        const btn = this.cancelButtons.get(pawn);
        if (!btn) return;
        pawn.removeChild(btn);
        btn.kill();
        this.cancelButtons.delete(pawn);
    }

    private createCancelButton(pawn: MapPawn) {
        if (this.cancelButtons.has(pawn)) return;
        const btn = new CancelMoveButton(() => this.manager.cancelPawnMove(pawn));
        pawn.addChild(btn);
        this.cancelButtons.set(pawn, btn);
    }

    private createBadgeCounter(pawn: MapPawn, node: MapNode) {
        const badge = new NodeCountBadge();
        pawn.addChild(badge);
        this.badges.set(node, badge);
    }
}