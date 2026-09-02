import { EventEmitter } from "excalibur";
import { MapNode } from "./mapNode";
import { MapPawn } from "./mapPawn";

export interface MapManagerMapNodeData {
    mapNode: MapNode;
}

export class MapManager {
    public customEvents = new EventEmitter<{
        nodeHovered: MapManagerMapNodeData;
        nodeClicked: MapManagerMapNodeData;
    }>();

    mapNodes: MapNode[] = []
    mapConnections: Record<string, MapNode[]> = {}
    private pawnsByNode = new Map<MapNode, Set<MapPawn>>();
    private nodeByPawn = new Map<MapPawn, MapNode>();
    private SET_EMPTY = new Set<MapPawn>()

    addNode(mapNode: MapNode) {
        this.mapNodes.push(mapNode)

        mapNode.customEvents.on('nodeHovered', (x) => {
            this.customEvents.emit('nodeHovered', { mapNode: mapNode })
        })

        mapNode.customEvents.on('nodeClicked', (x) => {
            this.customEvents.emit('nodeClicked', { mapNode: mapNode })
        })
    }

    connectMapNodes(node1: MapNode, node2: MapNode, mirrorConnection: boolean = true) {
        if (this.mapConnections[node1.nodeId]) {
            if (this.mapConnections[node1.nodeId].includes(node2)) {
                console.warn("Duplicating id")
                return
            }
            this.mapConnections[node1.nodeId].push(node2)
        } else {
            this.mapConnections[node1.nodeId] = [node2]
        }

        if (mirrorConnection)
            this.connectMapNodes(node2, node1, false)
    }

    getNeigbours(node: MapNode): MapNode[] {
        return this.mapConnections[node.nodeId] ?? []
    }

    placePawn(pawn: MapPawn, node: MapNode) {
        this.removePawn(pawn);
        this.nodeByPawn.set(pawn, node);
        let set = this.pawnsByNode.get(node);
        if (!set) {
            set = new Set();
            this.pawnsByNode.set(node, set);
        }
        set.add(pawn);
    }

    removePawn(pawn: MapPawn) {
        const current = this.nodeByPawn.get(pawn);
        if (current === undefined) return;
        this.pawnsByNode.get(current)?.delete(pawn);
        this.nodeByPawn.delete(pawn);
    }

    getPawnsAt(node: MapNode): ReadonlySet<MapPawn> {
        return this.pawnsByNode.get(node) ?? this.SET_EMPTY;
    }

    getPawnNode(pawn: MapPawn): MapNode | undefined {
        return this.nodeByPawn.get(pawn);
    }
}