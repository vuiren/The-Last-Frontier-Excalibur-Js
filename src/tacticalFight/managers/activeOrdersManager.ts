export class ActiveOrdersManager {
    cutOrderActive: boolean = false
    demolishOrderActive: boolean = false

    constructor() {

    }

    toggleCutOrder(disableOthers = true) {
        if (disableOthers) {
            this.demolishOrderActive = false
        }
        this.cutOrderActive = !this.cutOrderActive
    }

    toggleDemolishOrder(disableOthers = true) {
        if (disableOthers) {
            this.cutOrderActive = false
        }
        this.demolishOrderActive = !this.demolishOrderActive
    }
}