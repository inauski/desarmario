export const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function needsBackup(lastBackupAt: number | undefined, now: number, hasData: boolean) {
  if (!hasData) return false;
  return !lastBackupAt || now - lastBackupAt > THREE_DAYS_MS;
}
