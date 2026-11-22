/**
 * @name        Back up to a file and share it
 * @description Creates a manual backup file of the cellar and opens the share sheet to save it where you want.
 * @author      PLOC
 * @version     1.0.0
 * @category    backup
 * @permissions read
 * @sdk         1
 */

let file = null;
try {
    file = await sdk.backup.createBackupFile();
} catch (error) {
    return "Backup failed: " + error.message;
}
if (!file) {
    return "Backup failed";
}

// Do not delete the file here: the share sheet may still be using it.
await sdk.ui.shareFiles(file.path);
return `Backup created (${Math.round(file.size / 1024)} KB)`;
