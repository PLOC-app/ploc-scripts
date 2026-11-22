/**
 * @name        Wines with missing information
 * @description Lists the wines in stock with no vintage, color, country, estimated price or drinking window, to complete them.
 * @author      PLOC
 * @version     1.0.0
 * @category    maintenance
 * @permissions read
 * @sdk         1
 */

const checks = {
    vintage: w => w.vintage,
    color: w => w.colorId,
    country: w => w.countryId,
    price: w => w.estimatePrice,
    window: w => w.drinkPeriod?.from || w.drinkPeriod?.to || w.apogee?.from || w.apogee?.to
};

const wines = (await sdk.cellar.wine.getAll())
    .filter(w => (w.bottles ?? 0) > 0)
    .sortBy("name");

const report = [];
for (const w of wines) {
    const missing = Object.keys(checks).filter(field => !checks[field](w));
    if (missing.length) {
        report.push(`${w.name}: ${missing.join(", ")}`);
    }
}

if (report.length === 0) {
    return "Every wine in stock is complete";
}
return [`${report.length} of ${wines.count} wines in stock are incomplete`, ...report];
