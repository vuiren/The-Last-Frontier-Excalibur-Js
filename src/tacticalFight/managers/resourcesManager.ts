export class ResourcesManager {
  private _usedFood: number = 0;
  private _availableFood: number = 0;

  private foodCounterEl = document.getElementById("food-counter")!;

  constructor(startAvailableFood: number) {
    this._availableFood = startAvailableFood
  }

  get usedFood() {
    return this._usedFood;
  }
  set usedFood(value: number) {
    this._usedFood = value;
    this.updateDisplay();
  }

  get freeFood() {
    return this._availableFood - this._usedFood;
  }

  canAfford(foodCost: number): boolean {
    return this.freeFood >= foodCost;
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