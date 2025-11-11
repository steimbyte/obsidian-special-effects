import fs from "node:fs";

const manifestPath = "manifest.json";
const pkgPath = "package.json";

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

const newVersion = process.argv[2];

if (!newVersion) {
  console.error("Usage: npm run version -- <new_version>");
  process.exit(1);
}

manifest.version = newVersion;
pkg.version = newVersion;

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

console.log(`Version bumped to ${newVersion}`);

