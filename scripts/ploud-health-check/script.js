/**
 * @name        Ploud health check
 * @description Reports the Ploud state (enabled, status, last sync, locked cellar) in plain words and offers to open Ploud when something is wrong.
 * @author      PLOC
 * @version     1.0.0
 * @category    sync
 * @permissions read
 * @sdk         1
 */

const info = await sdk.ploud.getInfo();
const S = sdk.ploud.STATUS;
const problems = [];

if (!info.enabled) {
    problems.push(info.canEnable ? "Ploud is off but can be enabled" : "Ploud is off and needs an account");
} else {
    if (info.status === S.ERROR) {
        problems.push("The last sync failed");
    }
    if (info.cellarLocked) {
        problems.push("The cellar is locked: sync is blocked");
    }
    const days = info.lastSyncDate ? (Date.now() - info.lastSyncDate.getTime()) / 86400000 : null;
    if (days === null) {
        problems.push("Never synchronized");
    } else if (days > 7) {
        problems.push(`Last sync ${Math.floor(days)} days ago`);
    }
}

if (problems.length === 0) {
    return "Ploud is healthy, last sync " + info.lastSyncDate.toLocaleString();
}

const open = await sdk.dialog.confirm({ title: "Ploud", message: problems.join("\n") + "\n\nOpen Ploud?", okLabel: "Open" });
if (open) {
    await sdk.ploud.open();
}
return problems;
