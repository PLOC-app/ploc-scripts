/**
 * @name        Print the cellar book to PDF
 * @description Creates the cellar book as a PDF and shares it.
 * @author      PLOC
 * @version     1.0.0
 * @category    export
 * @permissions read
 * @sdk         1
 */

const file = await sdk.pdf.createFile();
if (!file) {
    return "Print failed";
}

await sdk.ui.shareFiles(file.path);
