import Dexie from "dexie";

export interface Workspace { key: string; name: string }
export const DEFAULT_KEY = "armario";
const LIST = "desarmario-projects";
const ACTIVE = "desarmario-active";
export const MAX_PROJECTS = 2;

const ls = () => (typeof window === "undefined" ? null : window.localStorage);

export function listWorkspaces(): Workspace[] {
  try {
    const raw = JSON.parse(ls()?.getItem(LIST) ?? "null");
    if (Array.isArray(raw) && raw.length) return raw;
  } catch { /* ignore */ }
  return [{ key: DEFAULT_KEY, name: "Mi armario" }];
}

export function activeWorkspaceKey(): string {
  const key = ls()?.getItem(ACTIVE);
  return key && listWorkspaces().some((w) => w.key === key) ? key : DEFAULT_KEY;
}

const save = (list: Workspace[]) => ls()?.setItem(LIST, JSON.stringify(list));

export function renameWorkspace(key: string, name: string) {
  save(listWorkspaces().map((w) => (w.key === key ? { ...w, name } : w)));
}

export function switchWorkspace(key: string) {
  ls()?.setItem(ACTIVE, key);
  window.location.assign("/");
}

export function createWorkspace(name: string) {
  const list = listWorkspaces();
  if (list.length >= MAX_PROJECTS) throw new Error("Máximo de proyectos alcanzado");
  const key = `armario-${Date.now()}`;
  save([...list, { key, name }]);
  return key;
}

export async function deleteWorkspace(key: string) {
  const list = listWorkspaces();
  if (list.length <= 1) return;
  save(list.filter((w) => w.key !== key));
  await Dexie.delete(key);
  if (activeWorkspaceKey() === key || ls()?.getItem(ACTIVE) === key) ls()?.setItem(ACTIVE, list.find((w) => w.key !== key)!.key);
}
