import { AsepriteResource } from "@excaliburjs/plugin-aseprite";
import { ImageSource, Loader } from "excalibur";

export const Resources = {
  Sword: new ImageSource("./images/sword.png"),
  SoldierUnit: new AsepriteResource('./units/Soldier.json'),
  SoldierZombie: new AsepriteResource('./units/SoldierZombie.json'),
  FlagMarker: new AsepriteResource('./units/FlagMarker.json'),
  PlayerBase: new AsepriteResource('./buildings/Casarm 2.json'),
  Bridge: new AsepriteResource('./buildings/Bridge.json'),
  Barricade: new AsepriteResource('./buildings/NewBarricade.json'),
} as const;

export const loader = new Loader();
for (const res of Object.values(Resources)) {
  loader.addResource(res);
}
