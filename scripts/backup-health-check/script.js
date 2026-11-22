/**
 * @name        Backup health check
 * @description Checks how old the last backup is and, when it is older than 7 days, offers to back up now and waits for the result.
 * @author      PLOC
 * @version     1.0.0
 * @category    backup
 * @permissions read
 * @sdk         1
 */

const MAX_DAYS = 7;
const info = await sdk.backup.getInfo();
const dates = [info.lastBackupDate, info.lastManualBackupDate].filter(d => d);
const last = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;
const days = last ? Math.floor((Date.now() - last.getTime()) / 86400000) : null;

if (!info.enabled) {
    const open = await sdk.dialog.confirm("Automatic backup is off. Open the backup center?");
    if (open) {
        await sdk.backup.open();
    }
    return { automaticBackup: false, lastBackup: last ? last.toISOString() : null, days };
}
if (days !== null && days <= MAX_DAYS) {
    return `Healthy: last backup ${days} day(s) ago`;
}

const ok = await sdk.dialog.confirm(last
    ? `Last backup was ${days} days ago. Back up now?`
    : "No backup found. Back up now?");
if (!ok) {
    return "Backup is " + (last ? days + " days old" : "missing");
}

await sdk.backup.backupNow();
// Poll the status for up to 2 minutes.
const S = sdk.backup.STATUS;
let status = S.FETCHING;
for (let i = 0; i < 60 && status !== S.IDLE && status !== S.ERROR; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    status = (await sdk.backup.getInfo()).status;
}

if (status === S.ERROR) {
    return "Backup failed: open the backup center for details";
}
return status === S.IDLE ? "Backup done" : "Backup still running";
