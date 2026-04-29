import type { Plugin } from "vite";
import { promises as fs } from "fs";
import * as path from "path";

/**
 * This plugin:
 * 1) Detects env from CI_ENVIRONMENT (fallback NODE_ENV -> development)
 * 2) Loads JSON at ./configs/aasa.<env>.json (fallback ./configs/aasa.json)
 * 3) Validates legacy AASA schema { applinks: { apps: [], details: [{ appID, paths }] } }
 * 4) Writes to <outDir>/.well-known/apple-app-site-association and <outDir>/apple-app-site-association
 */

type LegacyDetail = { appID: string; paths: string[] };
type LegacyPayload = {
  applinks: {
    apps: any[];
    details: LegacyDetail[];
  };
};

function envName(): string {
  const raw = process.env.CI_ENVIRONMENT || process.env.VITE_STAGE || "development";
  return String(raw).trim();
}

function mapEnvToFile(env: string): string {
  // mirror your .env mapping style
  const envFileMap: Record<string, string> = {
    unstable: "aasa.unstable.json",
    staging: "aasa.staging.json",
    production: "aasa.prod.json",
    prod: "aasa.prod.json",
    development: "aasa.development.json",
  };
  return envFileMap[env] || "aasa.json"; // final fallback
}

async function loadAASAJSON(configDir: string, fileName: string): Promise<LegacyPayload> {
  const primary = path.resolve(configDir, fileName);
  const fallback = path.resolve(configDir, "aasa.json");

  let srcFile = primary;
  let raw: string | undefined;

  try {
    raw = await fs.readFile(primary, "utf-8");
  } catch {
    // fallback file
    raw = await fs.readFile(fallback, "utf-8");
    srcFile = fallback;
  }

  let json: any;
  try {
    json = JSON.parse(raw);
  } catch (e: any) {
    throw new Error(`[AASA] Invalid JSON in ${srcFile}: ${e?.message || e}`);
  }
  return json;
}

function normalizePathPattern(p: string): string {
  // keep legacy semantics but prefer "/prefix/*" over "/prefix*"
  if (p === "*" || p === "/*" || p.startsWith("NOT ")) return p;
  if (p.endsWith("*") && !p.endsWith("/*")) return p.replace(/\*$/, "/*");
  return p;
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function validateLegacy(payload: any) {
  if (!payload || typeof payload !== "object") throw new Error("AASA: payload missing.");
  const al = payload.applinks;
  if (!al || typeof al !== "object") throw new Error("AASA: missing 'applinks'.");
  if (!Array.isArray(al.apps)) throw new Error("AASA: 'applinks.apps' must be an array.");
  if (!Array.isArray(al.details) || al.details.length === 0) {
    throw new Error("AASA: 'applinks.details' must be a non-empty array.");
  }
  for (const d of al.details) {
    if (typeof d?.appID !== "string") throw new Error("AASA: each detail requires appID:string.");
    if (!Array.isArray(d?.paths)) throw new Error("AASA: each detail requires paths:string[].");
  }
}

export default function vitePluginAASALegacyAuto(): Plugin {
  let outDir = "dist";
  const configDir = path.resolve(__dirname, "./configs");

  const writeFiles = async (body: string) => {
    const wkDir = path.join(outDir, ".well-known");
    await fs.mkdir(wkDir, { recursive: true });
    await fs.writeFile(path.join(wkDir, "apple-app-site-association"), body, "utf-8");
    await fs.writeFile(path.join(outDir, "apple-app-site-association"), body, "utf-8");
  };

  const generate = async () => {
    const env = envName();
    const fileName = mapEnvToFile(env);

    const payload = await loadAASAJSON(configDir, fileName);
    // basic normalize/dedupe while keeping legacy schema
    payload.applinks.details = payload.applinks.details
      .filter((d: LegacyDetail) => d && typeof d.appID === "string" && Array.isArray(d.paths))
      .map((d: LegacyDetail) => ({
        appID: d.appID.trim(),
        paths: uniq(d.paths.map(normalizePathPattern)),
      }))
      .filter((d: LegacyDetail) => d.appID && d.paths.length > 0);

    validateLegacy(payload);

    const isProdLike = ["production", "prod"].includes(env.toLowerCase());
    const pretty = !isProdLike;
    const body = pretty ? JSON.stringify(payload, null, 2) : JSON.stringify(payload);

    const bytes = Buffer.byteLength(body, "utf8");
    if (bytes > 128 * 1024) {
      console.warn(`[AASA] WARNING: ${bytes}B exceeds 128KB. Apple may ignore oversized files.`);
    }

    await writeFiles(body);
    console.log(
      `[AASA] Generated for env="${env}" →\n` +
      `  - ${path.join(outDir, ".well-known/apple-app-site-association")}\n` +
      `  - ${path.join(outDir, "apple-app-site-association")}`
    );
  };

  return {
    name: "vite-plugin-aasa-legacy-auto",
    apply: "build",
    configResolved(cfg) {
      outDir = cfg.build?.outDir || outDir;
    },
    async buildStart() {
      await generate();
    },
    async writeBundle() {
      await generate();
    },
  };
}
