import { defineConfig } from "vite";

export default defineConfig({
    assetsInclude: ['**/*.aseprite', '**/*.ase'],
    base: './', // optionally give a base path, useful for itch.io to serve relative instead of the default absolut
    build: {
        target: 'esnext',
        assetsInlineLimit: 0, // excalibur can't handle inlined xml in prod
        sourcemap: true, // set to false for the final itch upload
    }
});
