import { Engine, Scene, vec } from "excalibur";
import { MapEntitiesSpawner } from "./mapEntitiesSpawner";
import { MapManager } from "./mapManager";
import { OWNER_LABEL, Ownership } from "../constants";
import { TurnManager } from "./turnManager";
import { NodePanel } from "./nodePanel";

export class StrategicMap extends Scene {
    private readonly mapManager: MapManager = new MapManager();
    private readonly entitiesSpawner: MapEntitiesSpawner;
    private readonly nodePanel: NodePanel = new NodePanel();
    private readonly turnManager: TurnManager = new TurnManager(Ownership.Player, this.mapManager);
    constructor() {
        super()
        this.entitiesSpawner = new MapEntitiesSpawner(this, this.mapManager)
    }

    override onInitialize(engine: Engine): void {
        this.wireUI()

        this.mapManager.customEvents.on('nodeHovered', (x) => {
            this.nodePanel.show(x.mapNode)
        })

        this.createLevel()
        this.camera.pos = vec(400, 500);
        this.entitiesSpawner.createMapPawn(this.mapManager.mapNodes[0])
    }

    wireUI() {
        const strategicMapUi = document.getElementById("strategic-map-ui") as HTMLElement
        strategicMapUi.hidden = false

        const endTurnButton = document.getElementById("end-turn-button") as HTMLButtonElement
        endTurnButton.addEventListener('click', () => {
            this.turnManager.endPlayerTurn();
        })

        const currentTurnText = document.getElementById("current-turn-text") as HTMLSpanElement
        this.turnManager.customEvents.on('turnChanged', (turnData) => {
            const ownerText = OWNER_LABEL[turnData.currentTurnOwner]
            currentTurnText.textContent = "Current turn: " + ownerText
        })
    }

    createLevel() {
        const node0 = this.entitiesSpawner.createMapNode(vec(0, 500), "node0", Ownership.Player)

        const node1 = this.entitiesSpawner.createMapNode(vec(200, 300), "node1", Ownership.Neutral)
        const node2 = this.entitiesSpawner.createMapNode(vec(200, 700), "node2", Ownership.Neutral)

        this.entitiesSpawner.createMapNodeConnection(node0, node1)
        this.entitiesSpawner.createMapNodeConnection(node0, node2)

        const node3 = this.entitiesSpawner.createMapNode(vec(400, 300), "node3", Ownership.Neutral)
        const node4 = this.entitiesSpawner.createMapNode(vec(400, 700), "node4", Ownership.Neutral)

        this.entitiesSpawner.createMapNodeConnection(node1, node3)
        this.entitiesSpawner.createMapNodeConnection(node2, node4)

        const node5 = this.entitiesSpawner.createMapNode(vec(600, 500), "node5", Ownership.Neutral)
        this.entitiesSpawner.createMapNodeConnection(node5, node3)
        this.entitiesSpawner.createMapNodeConnection(node5, node4)

        const node6 = this.entitiesSpawner.createMapNode(vec(800, 300), "node6", Ownership.Neutral)
        const node7 = this.entitiesSpawner.createMapNode(vec(800, 700), "node7", Ownership.Neutral)

        this.entitiesSpawner.createMapNodeConnection(node5, node6)
        this.entitiesSpawner.createMapNodeConnection(node5, node7)

        const node8 = this.entitiesSpawner.createMapNode(vec(1000, 500), "node8", Ownership.Enemy)

        this.entitiesSpawner.createMapNodeConnection(node6, node8)
        this.entitiesSpawner.createMapNodeConnection(node7, node8)

        const node9 = this.entitiesSpawner.createMapNode(vec(1200, 500), "node9", Ownership.Enemy)
        this.entitiesSpawner.createMapNodeConnection(node8, node9)
    }
}