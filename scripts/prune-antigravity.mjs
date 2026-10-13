#!/usr/bin/env node
/**
 * Build-time patcher for the Entigravity Route Desktop profile.
 * It uses a pinned upstream checkout and fails closed when source anchors drift.
 * No additional identity spoofing or anti-detection behavior is introduced.
 */
import fs from "node:fs";
import path from "node:path";

const MARK = "ENTIGRAVITY ROUTE DESKTOP: ANTIGRAVITY-ONLY BUILD PATCH";
const rootArg = process.argv.indexOf("--root");
const root = path.resolve(rootArg >= 0 ? process.argv[rootArg + 1] : process.cwd());
const changed = [];

function read(p) {
  const full = path.join(root, p);
  if (!fs.existsSync(full)) throw new Error("Expected upstream file missing: " + p);
  return fs.readFileSync(full, "utf8");
}
function write(p, value) {
  const full = path.join(root, p);
  if (read(p) === value) return;
  fs.writeFileSync(full, value, "utf8");
  changed.push(p);
}
function emptyObject(p, name) {
  const src = read(p);
  if (new RegExp("export\s+const\s+" + name + "\s*:\s*Record<string, any>\s*=\s*\{\s*\}\s*;").test(src)) return;
  const re = new RegExp("(export\s+const\s+" + name + "\b[^=]*=\s*\{)[\s\S]*?\n\};");
  if (!re.test(src)) throw new Error("Cannot locate provider map " + name + " in " + p);
  write(p, src.replace(re, "export const " + name + ": Record<string, any> = {};"));
}
function patchExecutorMap(p, name, typeName) {
  const src = read(p);
  if (src.includes(MARK)) return;
  const re = new RegExp(name + ":[\s\S]*?=\s*\{[\s\S]*?\n\};");
  if (!re.test(src)) throw new Error("Cannot locate executor map " + name + " in " + p);
  const replacement = MARK + "\n" + name + ": " + typeName + " = {\n" +
    '  antigravity: () => import("./antigravity.ts").then((m) => new m.AntigravityExecutor()),\n' +
    '  agy: () => import("./antigravity.ts").then((m) => new m.AntigravityExecutor()),\n};';
  write(p, src.replace(re, replacement));
}
function requireContains(src, needle, label) {
  if (!src.includes(needle)) throw new Error("Patch verification failed: " + label);
}

patchExecutorMap("open-sse/executors/index.ts", "const lazyExecutors", "Record<string, () => Promise<BaseExecutor>>");
patchExecutorMap("open-sse/executors/credential.ts", "const specializedCredentialExecutors", "Record<string, CredentialExecutorLoader>");

write("open-sse/config/providers/index.ts",
  "/* " + MARK + " */\n" +
  'import type { RegistryEntry } from "./shared.ts";\n' +
  'import { antigravityProvider } from "./registry/antigravity/index.ts";\n' +
  'import { agyProvider } from "./registry/agy/index.ts";\n\n' +
  "export const REGISTRY: Record<string, RegistryEntry> = {\n" +
  "  antigravity: antigravityProvider,\n  agy: agyProvider,\n};\n");

write("src/lib/oauth/providers/index.ts",
  "/* " + MARK + " */\n" +
  'import { antigravity } from "./antigravity";\n' +
  'import { agy } from "./agy";\n\n' +
  "export const PROVIDERS = { antigravity, agy };\nexport default PROVIDERS;\n");

write("src/lib/providers/staticModels.ts",
  "/* " + MARK + " */\n" +
  'import { getRegistryEntry } from "@omniroute/open-sse/config/providerRegistry.ts";\n\n' +
  "export type LocalCatalogModel = { id: string; name?: string; apiFormat?: string; supportedEndpoints?: string[] };\n\n" +
  "export function getStaticModelsForProvider(provider: string): LocalCatalogModel[] | undefined {\n" +
  '  if (provider !== "antigravity" && provider !== "agy") return undefined;\n' +
  "  const models = getRegistryEntry(provider)?.models ?? [];\n" +
  "  return models.map((model) => ({ id: model.id, name: model.name || model.id }));\n}\n");

write("src/shared/constants/providers/oauth.ts",
  "/* " + MARK + " */\n" +
  "export const OAUTH_PROVIDERS: Record<string, any> = {\n" +
  '  antigravity: { id: "antigravity", serviceKinds: ["llm"], name: "Antigravity", icon: "rocket_launch", color: "#F59E0B", subscriptionRisk: true, riskNoticeVariant: "oauth" },\n' +
  '  agy: { id: "agy", serviceKinds: ["llm"], alias: "agy", name: "Antigravity CLI", icon: "terminal", color: "#F59E0B", textIcon: "AGY", website: "https://antigravity.google", subscriptionRisk: true, riskNoticeVariant: "oauth", hasFree: true },\n' +
  "};\n");
emptyObject("src/shared/constants/providers/noauth.ts", "NOAUTH_PROVIDERS");
const noAuthPath = "src/shared/constants/providers/noauth.ts";
let noAuth = read(noAuthPath);
if (!noAuth.includes("NOAUTH_PROVIDER_PROXY_SUPPORTED = new Set<string>();")) {
  const re = /export const NOAUTH_PROVIDER_PROXY_SUPPORTED = new Set\([\s\S]*?\);/;
  if (!re.test(noAuth)) throw new Error("Cannot locate no-auth proxy catalog");
  noAuth = noAuth.replace(re, "export const NOAUTH_PROVIDER_PROXY_SUPPORTED = new Set<string>();");
  write(noAuthPath, noAuth);
}
emptyObject("src/shared/constants/providers/apikey/index.ts", "APIKEY_PROVIDERS");
emptyObject("src/shared/constants/providers/web-cookie.ts", "WEB_COOKIE_PROVIDERS");
emptyObject("src/shared/constants/providers/local.ts", "LOCAL_PROVIDERS");
emptyObject("src/shared/constants/providers/search.ts", "SEARCH_PROVIDERS");
emptyObject("src/shared/constants/providers/audio.ts", "AUDIO_ONLY_PROVIDERS");
emptyObject("src/shared/constants/providers/upstream-proxy.ts", "UPSTREAM_PROXY_PROVIDERS");
emptyObject("src/shared/constants/providers/cloud-agent.ts", "CLOUD_AGENT_PROVIDERS");
emptyObject("src/shared/constants/providers/system.ts", "SYSTEM_PROVIDERS");

const providerPath = "src/shared/constants/providers.ts";
let providerSrc = read(providerPath);
if (!providerSrc.includes(MARK)) {
  const pairs = [
    ['export function isOpenAICompatibleProvider(providerId: unknown): providerId is string {\n  return typeof providerId === "string" && providerId.startsWith(OPENAI_COMPATIBLE_PREFIX);\n}',
     'export function isOpenAICompatibleProvider(providerId: unknown): providerId is string {\n  return process.env.ANTIGRAVITY_ROUTE_DESKTOP !== "1" && typeof providerId === "string" && providerId.startsWith(OPENAI_COMPATIBLE_PREFIX);\n}'],
    ['export function isAnthropicCompatibleProvider(providerId: unknown): providerId is string {\n  return typeof providerId === "string" && providerId.startsWith(ANTHROPIC_COMPATIBLE_PREFIX);\n}',
     'export function isAnthropicCompatibleProvider(providerId: unknown): providerId is string {\n  return process.env.ANTIGRAVITY_ROUTE_DESKTOP !== "1" && typeof providerId === "string" && providerId.startsWith(ANTHROPIC_COMPATIBLE_PREFIX);\n}'],
    ['export function isClaudeCodeCompatibleProvider(providerId: unknown): providerId is string {\n  return typeof providerId === "string" && providerId.startsWith(CLAUDE_CODE_COMPATIBLE_PREFIX);\n}',
     'export function isClaudeCodeCompatibleProvider(providerId: unknown): providerId is string {\n  return process.env.ANTIGRAVITY_ROUTE_DESKTOP !== "1" && typeof providerId === "string" && providerId.startsWith(CLAUDE_CODE_COMPATIBLE_PREFIX);\n}']
  ];
  for (const [needle, replacement] of pairs) {
    requireContains(providerSrc, needle, "generic provider predicate");
    providerSrc = providerSrc.replace(needle, replacement);
  }
  write(providerPath, "/* " + MARK + " */\n" + providerSrc);
}

const retirementPath = "src/shared/constants/providerRetirement.ts";
let retirementSrc = read(retirementPath);
if (!retirementSrc.includes(MARK)) {
  const needle = "export function assertRuntimeProviderAvailable(providerId: unknown): void {\n  if (!isRuntimeRetiredProviderId(providerId)) return;";
  const replacement = "/* " + MARK + " */\nexport function assertRuntimeProviderAvailable(providerId: unknown): void {\n" +
    '  const id = typeof providerId === "string" ? providerId.trim().toLowerCase() : "";\n' +
    '  if (process.env.ANTIGRAVITY_ROUTE_DESKTOP === "1" && id && id !== "antigravity" && id !== "agy") {\n' +
    '    const error = new Error("This build only supports Google Antigravity.") as RuntimeProviderRetirementError;\n' +
    "    error.code = RUNTIME_PROVIDER_RETIRED_ERROR_CODE; error.status = 410; throw error;\n  }\n" +
    "  if (!isRuntimeRetiredProviderId(providerId)) return;";
  requireContains(retirementSrc, needle, "runtime provider allowlist");
  write(retirementPath, retirementSrc.replace(needle, replacement));
}

const packagePath = "electron/package.json";
const pkg = JSON.parse(read(packagePath));
pkg.name = "entigravity-route-desktop";
pkg.version = "0.1.0";
pkg.description = "Antigravity-only local API gateway for Windows";
pkg.author = { name: "Entigravity Route Desktop" };
pkg.homepage = "";
pkg.build = pkg.build || {};
pkg.build.appId = "com.entigravity.route.desktop";
pkg.build.productName = "Entigravity Route Desktop";
pkg.build.copyright = "Copyright (c) 2026 Entigravity Route Desktop";
delete pkg.build.publish;
write(packagePath, JSON.stringify(pkg, null, 2) + "\n");

const mainPath = "electron/main.js";
let main = read(mainPath);
if (!main.includes(MARK)) {
  const before = main;
  main = main.replace('const path = require("path");',
    'const path = require("path");\n// ' + MARK + '\nprocess.env.ANTIGRAVITY_ROUTE_DESKTOP = "1";');
  main = main.replace('env: {\n      ...serverEnv,\n      DATA_DIR: dataDir,',
    'env: {\n      ...serverEnv,\n      ANTIGRAVITY_ROUTE_DESKTOP: "1",\n      DATA_DIR: dataDir,');
  main = main.replace('path.join(appData, "omniroute")', 'path.join(appData, "entigravity-route-desktop")');
  main = main.replace('path.join(path.resolve(xdg), "omniroute")', 'path.join(path.resolve(xdg), "entigravity-route-desktop")');
  main = main.replace('path.join(require("os").homedir(), ".omniroute")', 'path.join(require("os").homedir(), ".entigravity-route-desktop")');
  main = main.replace('async function checkForUpdates(silent = false) {\n  if (isDev) {',
    'async function checkForUpdates(silent = false) {\n  if (process.env.ANTIGRAVITY_ROUTE_DESKTOP === "1") return;\n  if (isDev) {');
  requireContains(main, 'process.env.ANTIGRAVITY_ROUTE_DESKTOP = "1";', "desktop runtime flag");
  requireContains(main, 'ANTIGRAVITY_ROUTE_DESKTOP: "1",', "child runtime flag");
  requireContains(main, "entigravity-route-desktop", "isolated data directory");
  requireContains(main, 'if (process.env.ANTIGRAVITY_ROUTE_DESKTOP === "1") return;', "disable inherited updater");
  if (main === before) throw new Error("electron/main.js did not change");
  write(mainPath, main);
}

const executors = read("open-sse/executors/index.ts");
const oauth = read("src/lib/oauth/providers/index.ts");
const registry = read("open-sse/config/providers/index.ts");
requireContains(executors, "antigravity:", "Antigravity executor");
requireContains(executors, "agy:", "AGY executor");
const mapStart = executors.indexOf("const lazyExecutors");
const mapEnd = executors.indexOf("\n};", mapStart);
if (/github:|codex:|claude:/.test(executors.slice(mapStart, mapEnd))) {
  throw new Error("Unrelated executor remains in the central executor map");
}
requireContains(oauth, "antigravity", "Antigravity OAuth provider");
requireContains(oauth, "agy", "AGY OAuth provider");
if (/import \{ (claude|codex|github|qoder) \}/.test(oauth)) throw new Error("Unrelated OAuth import remains");
requireContains(registry, "antigravity: antigravityProvider", "Antigravity catalog entry");
requireContains(registry, "agy: agyProvider", "AGY catalog entry");

console.log(MARK + ": " + changed.length + " source files changed in " + root);
for (const p of changed) console.log(" - " + p);
