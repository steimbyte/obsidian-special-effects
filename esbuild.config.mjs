import esbuild from "esbuild";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const entryFile = "src/main.ts";
const outDir = ".";

const isWatch = process.argv.includes("--watch");

const banner =
  "/*\n" +
  "THIS IS A GENERATED FILE. Source: src/main.ts\n" +
  "*/";

const ctx = await esbuild.context({
  entryPoints: [resolve(__dirname, entryFile)],
  bundle: true,
  format: "cjs",
  platform: "browser",
  target: ["es2020"],
  outfile: resolve(__dirname, outDir, "main.js"),
  external: ["obsidian"],
  banner: { js: banner },
  sourcemap: isWatch ? "inline" : false,
});

if (isWatch) {
  await ctx.watch();
  console.log("Watching for changes...");
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log("Build complete.");
}

