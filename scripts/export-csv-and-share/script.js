/**
 * @name        Export to CSV and share
 * @description Exports the cellar to CSV files and opens the share sheet.
 * @author      PLOC
 * @version     1.0.0
 * @category    export
 * @permissions read
 * @sdk         1
 */

const files = await sdk.csv.createFiles();
if (!files) {
    return "Export failed";
}

await sdk.ui.shareFiles(files.map(f => f.path));
