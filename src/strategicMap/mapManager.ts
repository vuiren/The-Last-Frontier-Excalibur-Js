import { EventEmitter } from "excalibur";
import { MapNode } from "./mapNode";
import { MapPawn } from "./mapPawn";
import { Ownership } from "../constants";

export interface MapManagerMapNodeData {
    mapNode: MapNode;
}

export class MapManager {
    public customEvents = new EventEmitter<{
        nodeHovered: MapManagerMapNodeData;
        nodeClicked: MapManagerMapNodeData;
        nodeOccupancyChanged: { mapNode: MapNode; pawns: ReadonlySet<MapPawn> };
        pawnMovePlanned: { pawn: MapPawn; from: MapNode; to: MapNode };
        pawnMoveCancelled: { pawn: MapPawn };
    }>();

    mapNodes: MapNode[] = []
    mapConnections: Record<string, MapNode[]> = {}
    private pawnsByNodeId = new Map<string, Set<MapPawn>>();
    private nodeByPawn = new Map<MapPawn, MapNode>();

    private pawnsOnTheMove = new Set<MapPawn>()

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

    areNeighbours(node1: MapNode, node2: MapNode) {
        return this.getNeigbours(node1).some(x => x === node2)
    }

    planPawnMove(pawn: MapPawn, targetNode: MapNode) {
        pawn.setTargetNode(targetNode)
        this.pawnsOnTheMove.add(pawn)
        this.customEvents.emit('pawnMovePlanned', { pawn, from: pawn.getOwnerNode(), to: targetNode })
    }

    cancelPawnMove(pawn: MapPawn) {
        if (!this.pawnsOnTheMove.delete(pawn)) return;
        pawn.setTargetNode(null);
        this.customEvents.emit('pawnMoveCancelled', { pawn });
        const node = this.nodeByPawn.get(pawn);
        if (node) this.customEvents.emit('nodeOccupancyChanged', { mapNode: node, pawns: this.getPawnsAt(node) });
    }

    movePawns() {
        const pawns = [...this.pawnsOnTheMove]
        pawns.forEach(x => {
            const targetNode = x.getTargetNode()
            if (targetNode !== null)
                this.placePawn(x, targetNode)
        })

        this.pawnsOnTheMove.clear()
    }

    placePawn(pawn: MapPawn, node: MapNode) {
        this.removePawn(pawn);
        this.nodeByPawn.set(pawn, node);
        pawn.setOwnerNode(node)
        pawn.setTargetNode(null)
        let set = this.pawnsByNodeId.get(node.nodeId);
        if (!set) {
            set = new Set();
            this.pawnsByNodeId.set(node.nodeId, set);
        }
        set.add(pawn);
    }

    removePawn(pawn: MapPawn) {
        const current = this.nodeByPawn.get(pawn);
        if (current === undefined) return;
        this.pawnsByNodeId.get(current.nodeId)?.delete(pawn);
        this.nodeByPawn.delete(pawn);
    }

    getPawnsOnTheMove(): MapPawn[] {
        return [...this.pawnsOnTheMove]
    }


    getPawnsAt(node: MapNode): MapPawn[] {
        const set2 = this.pawnsByNodeId.get(node.nodeId)?.difference(this.pawnsOnTheMove)
        if (set2 !== undefined) return [...set2]
        else return []
    }

    getPawnNode(pawn: MapPawn): MapNode | undefined {
        return this.nodeByPawn.get(pawn);
    }

    getEnemyMapNodes() {
        const enemyNodes = this.mapNodes.filter(x => x.owner === Ownership.Enemy)
        return enemyNodes
    }

    getEnemyPawns() {
        const enemyNodes = this.getEnemyMapNodes()
        let allEnemyPawns: MapPawn[] = []
        for (const node of enemyNodes) {
            const pawns = this.getPawnsAt(node).filter(x => x.faction === Ownership.Enemy)
            allEnemyPawns = allEnemyPawns.concat(pawns)
        }

        return allEnemyPawns
    }
}