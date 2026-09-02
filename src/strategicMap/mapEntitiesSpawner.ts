import { Scene, vec, Vector } from "excalibur";
import { Ownership } from "../constants";
import { MapNode } from "./mapNode";
import { MapManager } from "./mapManager";
import { EdgeActor } from "./edgeActor";
import { MapPawn } from "./mapPawn";

export class MapEntitiesSpawner {
    constructor(
        private readonly scene: Scene,
        private readonly mapManager: MapManager,
    ) { }

    createMapNode(pos: Vector, nodeId: string, owner: Ownership) {
        const mapNode = new MapNode(pos, nodeId, owner)
        this.mapManager.addNode(mapNode)

        this.scene.add(mapNode);

        return mapNode;
    }

    createMapNodeConnection(node1: MapNode, node2: MapNode) {
        const connection = new EdgeActor(node1, node2)
        this.scene.add(connection)

        this.mapManager.connectMapNodes(node1, node2)

        return connection
    }

    createMapPawn(mapNode: MapNode) {
        const pawn = new MapPawn(mapNode.pos.add(vec(0, -75)))
        this.scene.add(pawn)

        this.mapManager.placePawn(pawn, mapNode)
        return pawn;
    }
}