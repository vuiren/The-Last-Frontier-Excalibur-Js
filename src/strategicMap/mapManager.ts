import { MapNode } from "./mapNode";

export class MapManager {
    mapNodes: MapNode[] = []
    mapConnections: Record<string, MapNode[]> = {}

    addNode(mapNode: MapNode) {
        this.mapNodes.push(mapNode)
    }

    connectMapNodes(node1: MapNode, node2: MapNode, mirrorConnection: boolean = true) {
        if (this.mapConnections[node1.nodeId]) {
            if(this.mapConnections[node1.nodeId].includes(node2)){
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
}