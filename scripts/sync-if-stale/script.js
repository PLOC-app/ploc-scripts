/**
 * @name        Sync with Ploud if out of date
 * @description Starts a Ploud synchronization only when the last one is older than a set number of hours (24 by default).
 * @author      PLOC
 * @version     1.0.0
 * @category    sync
 * @permissions read
 * @sdk         1
 */

// Change the threshold once with sdk.storage.set("sync-if-stale.maxHours", 6).
const maxHours = await sdk.storage.get("sync-if-stale.maxHours", 24);

const info = await sdk.ploud.getInfo();
if (!info.enabled) {
    return "Ploud is not enabled";
}
if (info.status === sdk.ploud.STATUS.WORKING) {
    return "A sync is already running";
}

const hours = info.lastSyncDate ? (Date.now() - info.lastSyncDate.getTime()) / 3600000 : Infinity;
if (hours < maxHours) {
    return `Up to date: last sync ${Math.round(hours * 10) / 10} h ago`;
}

const ok = await sdk.ploud.syncNow();
if (!ok) {
    return info.cellarLocked ? "Cellar locked, try again later" : "Sync not possible";
}

await sdk.dialog.toast("Ploud sync started");
return info.lastSyncDate ? `Sync started (last one ${Math.round(hours)} h ago)` : "Sync started (first sync)";
