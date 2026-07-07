import { AsepriteResource } from "@excaliburjs/plugin-aseprite";
import { LdtkResource } from "@excaliburjs/plugin-ldtk";
import { ImageSource, Loader } from "excalibur";

export const Resources = {
  Sword: new ImageSource("./images/sword.png"),
  SoldierUnit: new AsepriteResource('./units/Soldier.json'),
  SoldierZombie: new AsepriteResource('./units/SoldierZombie.json'),
  FlagMarker: new AsepriteResource('./units/FlagMarker.json'),
  PlayerBase: new AsepriteResource('./buildings/Casarm 2.json'),
  Bridge: new AsepriteResource('./buildings/Bridge.json'),
  Barricade: new AsepriteResource('./buildings/NewBarricade.json'),
  DeadSoldier: new AsepriteResource('./units/DeadSoldier.json'),

  UpArrow: new ImageSource('./icons/upArrow.png'),
  DownArrow: new ImageSource('./icons/downArrow.png'),

  FarmHouse: new AsepriteResource('./buildings/FarmHouse.json'),
  InfectedFarmHouse: new AsepriteResource('./buildings/InfectedFarmHouse.json'),

  CaptureZoneFlag: new AsepriteResource('./buildings/CaptureZoneFlag.json'),

  FirstLevel: new LdtkResource('./Ldtk/FirstLevel.ldtk'),

} as const;

export const loader = new Loader();
for (const res of Object.values(Resources)) {
  loader.addResource(res);
}
