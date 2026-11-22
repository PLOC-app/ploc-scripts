/**
 * @name        Which wine tonight?
 * @description Picks a random wine in stock, preferring those ready to drink this year, and offers to open it.
 * @author      PLOC
 * @version     1.0.0
 * @category    misc
 * @permissions read
 * @sdk         1
 */

const year = new Date().getFullYear();
const windowOf = w => (w.drinkPeriod?.from || w.drinkPeriod?.to) ? w.drinkPeriod : w.apogee;
const isReady = w => {
    const p = windowOf(w);
    return p && (p.from || p.to) && (p.from ?? 0) <= year && year <= (p.to ?? 9999);
};

const inStock = (await sdk.cellar.wine.getAll()).filter(w => (w.bottles ?? 0) > 0);
if (inStock.isEmpty) {
    return "No wine in stock";
}

const ready = inStock.filter(isReady);
const pool = (ready.isEmpty ? inStock : ready).toArray();
const wine = pool[Math.floor(Math.random() * pool.length)];
const label = wine.name + (wine.vintage ? " " + wine.vintage : "");

await sdk.haptics.success();
const open = await sdk.dialog.confirm({
    title: "Tonight",
    message: `${label}\n${wine.bottles} bottle(s) left` + (isReady(wine) ? ", ready to drink" : ""),
    okLabel: "Open",
    cancelLabel: "Close"
});
if (open) {
    await sdk.ui.openWine(wine.id);
}
return label;
