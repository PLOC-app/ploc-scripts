/**
 * @name        Wines past their drinking window
 * @description Lists the wines in stock whose drinking window ended before this year, oldest first: open them soon.
 * @author      PLOC
 * @version     1.0.0
 * @category    inventory
 * @permissions read
 * @sdk         1
 */

const year = new Date().getFullYear();

// End of the drinking window (a year): drinkPeriod, or apogee when it is not set.
const endOf = w => w.drinkPeriod?.to || w.apogee?.to || null;

const wines = await sdk.cellar.wine.getAll();
const late = wines
    .filter(w => (w.bottles ?? 0) > 0 && endOf(w) && endOf(w) < year)
    .toArray()
    .sort((a, b) => endOf(a) - endOf(b));

if (late.length === 0) {
    return "No wine in stock is past its drinking window";
}

return late.map(w => {
    const vintage = w.vintage ? " " + w.vintage : "";
    return `Until ${endOf(w)}: ${w.name}${vintage} (${w.bottles} bt)`;
});
