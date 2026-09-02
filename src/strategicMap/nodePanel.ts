import { OWNER_LABEL } from "../constants";
import { MapNode } from "./mapNode";

export class NodePanel {
  private readonly root: HTMLElement;
  private readonly fields = new Map<string, HTMLElement>();
  private current: MapNode | null = null;

  constructor() {
    this.root = document.getElementById('node-panel') as HTMLElement
    this.root.querySelectorAll<HTMLElement>("[data-field]").forEach((el) => {
      this.fields.set(el.dataset.field!, el);
    });
  }

  show(node: MapNode): void {
    this.current = node;
    this.render();
  }

  clear(node: MapNode): void {
    // Guard against enter(B) firing before leave(A)
    if (this.current !== node) return;
    this.current = null;
    this.root.classList.add("is-empty");
    this.root.removeAttribute("data-owner");
  }

  /** Call on turnChanged so a held-open panel doesn't go stale. */
  refresh(): void {
    if (this.current) this.render();
  }

  private render(): void {
    const node = this.current;
    if (!node) return;

    this.root.classList.remove("is-empty");
    this.root.dataset.owner = node.owner.toString();

    this.set("owner", OWNER_LABEL[node.owner]);
    this.set("name", node.nodeId);
  }

  private set(field: string, value: string): void {
    const el = this.fields.get(field);
    if (el) el.textContent = value;
  }
}