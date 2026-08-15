import { Color, DisplayMode, Engine, FadeInOut } from "excalibur";
import { loader } from "./resources";
import { MyLevel } from "./tacticalFight/level";
import { StrategicMap } from "./strategicMap/strategicMap";

// Goal is to keep main.ts small and just enough to configure the engine

const game = new Engine({
  width: 1920, // Logical width and height in game pixels
  height: 1080,
  maxFps: 120,
  displayMode: DisplayMode.FitScreenAndFill, // Display mode tells excalibur how to fill the window
  snapToPixel: true,
  pixelArt: true, // pixelArt will turn on the correct settings to render pixel art without jaggies or shimmering artifacts
  scenes: {
    start: StrategicMap
  },
  physics: {
    enabled: false,
  }
});

await game.start('start', { // name of the start scene 'start'
  loader, // Optional loader (but needed for loading images/sounds)
  inTransition: new FadeInOut({ // Optional in transitrion
    duration: 1000,
    direction: 'in',
    color: Color.fromHex("1F4073")
  })
})