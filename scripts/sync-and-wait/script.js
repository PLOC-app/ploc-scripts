/**
 * @name        Sync with Ploud and wait
 * @description Starts a Ploud synchronization, waits until it finishes (2 minutes max) and returns the result.
 * @author      PLOC
 * @version     1.0.0
 * @category    sync
 * @permissions read
 * @sdk         1
 */

const before = await sdk.ploud.getInfo();
if (!before.enabled) {
    return "Ploud is not enabled";
}

const started = await sdk.ploud.syncNow();
if (!started) {
    return before.cellarLocked ? "Cellar locked, try again later" : "Sync not possible";
}

const S = sdk.ploud.STATUS;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let info = before;
// Give the sync a moment to start, then poll every 2 seconds.
await wait(1000);
for (let i = 0; i < 60; i++) {
    info = await sdk.ploud.getInfo();
    if (info.status !== S.WORKING) {
        break;
    }
    await wait(2000);
}

if (info.status === S.ERROR) {
    return "Sync failed: open Ploud for details";
}
if (info.status === S.WORKING) {
    return "Sync still running";
}
return "Sync done" + (info.lastSyncDate ? " at " + info.lastSyncDate.toLocaleTimeString() : "");
