/**
 * @name        Cellar value
 * @description Estimates the value of the bottles in stock from each wine's estimated price, and lists the most valuable wines.
 * @author      PLOC
 * @version     1.0.0
 * @category    stats
 * @permissions read
 * @sdk         1
 */

const info = await sdk.cellar.getInfo();
const currency = info.currency ?? "";
const wines = (await sdk.cellar.wine.getAll()).filter(w => (w.bottles ?? 0) > 0);
if (wines.isEmpty) {
    return "No wine in stock";
}

let total = 0;
let pricedBottles = 0;
let unpriced = 0;
for (const w of wines) {
    if ((w.estimatePrice ?? 0) > 0) {
        total += w.estimatePrice * w.bottles;
        pricedBottles += w.bottles;
    } else {
        unpriced++;
    }
}

const money = n => `${Math.round(n).toLocaleString()} ${currency}`.trim();
const top = wines
    .filter(w => (w.estimatePrice ?? 0) > 0)
    .toArray()
    .sort((a, b) => b.estimatePrice * b.bottles - a.estimatePrice * a.bottles)
    .slice(0, 5)
    .map(w => `${w.name}${w.vintage ? " " + w.vintage : ""}: ${money(w.estimatePrice * w.bottles)}`);

return {
    estimatedValue: money(total),
    averagePerBottle: pricedBottles ? money(total / pricedBottles) : null,
    winesWithoutPrice: unpriced,
    mostValuable: top
};
