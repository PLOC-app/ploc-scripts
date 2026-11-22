/**
 * @name        Full archive: backup and CSV with documents
 * @description Creates a PLOC backup file plus the CSV export with photos and JSON data, and shares them all at once.
 * @author      PLOC
 * @version     1.0.0
 * @category    backup
 * @permissions read
 * @sdk         1
 */

const paths = [];
try {
    // The backup restores in PLOC; the CSV and documents stay readable without PLOC.
    const backup = await sdk.backup.createBackupFile();
    if (backup) {
        paths.push(backup.path);
    }
    const csvFiles = await sdk.csv.createFiles({ documents: true });
    for (const f of csvFiles ?? []) {
        paths.push(f.path);
    }
} catch (error) {
    return "Archive failed: " + error.message;
}

if (paths.length === 0) {
    return "Archive failed";
}

await sdk.ui.shareFiles(paths);
return paths.length + " files in the archive";
