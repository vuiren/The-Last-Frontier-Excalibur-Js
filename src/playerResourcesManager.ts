export class PlayerResourcesManager {
  private _usedFood: number = 0;
  private _availableFood: number = 0;

  private foodCounterEl = document.getElementById("food-counter")!;

  get usedFood() {
    return this._usedFood;
  }
  set usedFood(value: number) {
    this._usedFood = value;
    this.updateDisplay();
  }

  get availableFood() {
    return this._availableFood;
  }
  set availableFood(value: number) {
    this._availableFood = value;
    this.updateDisplay();
  }

  private updateDisplay() {
    this.foodCounterEl.textContent = `Food: ${this._usedFood}/${this._availableFood}`;
  }
}