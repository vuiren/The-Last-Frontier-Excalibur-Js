import { FactoryProps, LdtkResource } from '@excaliburjs/plugin-ldtk';
import { Scene } from 'excalibur';
import { Lane } from './constants';
import { Resources } from './resources';
import { EntitySpawner } from './entitySpawner';

export interface LevelImportDeps {
    entitySpawner: EntitySpawner;
}

// ---------------------------------------------------------------------------
// 3. Lane resolution.
//    In First_level.ldtk the two rows sit at y = 96 (Back) and y = 224 (Front)
//    inside a 256px-tall level. Anything above the mid-line is Back, below is Front.
//    Override the threshold if your level height changes.
// ---------------------------------------------------------------------------
const LANE_Y_THRESHOLD = 160;

function ldtkYToLane(worldY: number): Lane {
    return worldY < LANE_Y_THRESHOLD ? Lane.Back : Lane.Front;
}

// ---------------------------------------------------------------------------
// 4. Register a factory per LDtk entity identifier.
//
//    Each factory calls YOUR existing spawn function (which already adds the
//    actor to the scene and wires up the managers) and returns `undefined`,
//    so the plugin does NOT add anything itself. Returning undefined is the
//    supported way to say "I handled this entity, don't create a placeholder".
//
//    Call this BEFORE addToScene()/before the resource is processed.
// ---------------------------------------------------------------------------
export function registerLevelFactories(
    deps: LevelImportDeps,
    resource: LdtkResource = Resources.FirstLevel,
): void {
    const { entitySpawner } = deps;

    resource.registerEntityIdentifierFactories({
        // --- Player units (Units layer) ---
        PlayerSoldier: ({ worldPos }: FactoryProps) => {
            return entitySpawner.spawnPlayerUnit(worldPos.x, 'playerSoldier', ldtkYToLane(worldPos.y));
        },

        // --- Enemy units (Zombies layer) ---
        Zombie: ({ worldPos }: FactoryProps) => {
            return entitySpawner.spawnEnemyUnit(worldPos.x, 'enemyZombie', ldtkYToLane(worldPos.y));;
        },

        // --- Player base (Buildings layer) ---
        Casarm: ({ worldPos }: FactoryProps) => {
            return entitySpawner.spawnPlayerBase(
                worldPos.x,
                ldtkYToLane(worldPos.y),
            );;
        },

        // --- Player barricade (Buildings layer) ---
        Barricade: ({ worldPos }: FactoryProps) => {
            return entitySpawner.spawnBarricade(
                worldPos.x,
                ldtkYToLane(worldPos.y)
            );
        },

        // --- Infected building (Infected_Buildings layer) ---
        Infected_Building: ({ worldPos }: FactoryProps) => {
            return entitySpawner.spawnInfectedFarmHouse(
                worldPos.x,
                100,
                ldtkYToLane(worldPos.y),
            );;
        },
    });
}

// ---------------------------------------------------------------------------
// 5. One call that registers factories and renders the tile layers
//    (Floor + Bridges). Run this from your scene's onInitialize.
// ---------------------------------------------------------------------------
export function importLdtkLevel(
    scene: Scene,
    deps: LevelImportDeps,
    resource: LdtkResource = Resources.FirstLevel,
): void {
    registerLevelFactories(deps, resource);

    // Draws the Floor & Bridges tile layers and runs the entity factories above.
    // useLevelOffsets:false keeps the level at (0,0); drop it to keep LDtk's world layout.
    resource.addToScene(scene, { useLevelOffsets: false });
}