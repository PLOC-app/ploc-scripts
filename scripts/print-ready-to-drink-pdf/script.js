/**
 * @name        Print the wines ready to drink to PDF
 * @description Prints a PDF of the wines in stock whose drinking window includes this year, and shares it.
 * @author      PLOC
 * @version     1.0.0
 * @category    export
 * @permissions read
 * @sdk         1
 */

const year = new Date().getFullYear();

// Drinking window (years): use drinkPeriod, or apogee when drinkPeriod is not set.
const windowOf = w => (w.drinkPeriod?.from || w.drinkPeriod?.to) ? w.drinkPeriod : w.apogee;

const wines = await sdk.cellar.wine.getAll();
const ready = wines.filter(w => {
    const p = windowOf(w);
    if ((w.bottles ?? 0) <= 0 || !p || (!p.from && !p.to)) {
        return false;
    }
    return (p.from ?? 0) <= year && year <= (p.to ?? 9999);
});

if (ready.isEmpty) {
    return "No wine in stock is ready to drink in " + year;
}

// createFile expects an array of ids (a Collection would print everything).
const file = await sdk.pdf.createFile(ready.toArray().map(w => w.id));
if (!file) {
    return "Print failed";
}

await sdk.ui.shareFiles(file.path);
return ready.count + " wines printed";
