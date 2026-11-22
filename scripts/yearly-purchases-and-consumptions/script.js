/**
 * @name        Purchases and consumptions per year
 * @description Sums, per year, the bottles bought, the bottles consumed and the amount spent, from the cellar orders.
 * @author      PLOC
 * @version     1.0.0
 * @category    stats
 * @permissions read
 * @sdk         1
 */

const orders = await sdk.cellar.order.getAll();
if (orders.isEmpty) {
    return "No purchase or consumption recorded";
}

const years = new Map();
for (const o of orders) {
    const year = o.date ? o.date.getFullYear() : "No date";
    const y = years.get(year) ?? { bought: 0, consumed: 0, spent: 0 };
    const bought = o.purchases ?? 0;
    y.bought += bought;
    y.consumed += o.consumptions ?? 0;
    if (bought > 0) {
        // amount is the order total; fall back to unit price x quantity.
        y.spent += o.amount || (o.unitPrice ?? 0) * bought;
    }
    years.set(year, y);
}

const { currency } = await sdk.cellar.getInfo();
return [...years.entries()]
    .sort((a, b) => String(b[0]).localeCompare(String(a[0])))
    .map(([year, y]) => `${year}: +${y.bought} bought, -${y.consumed} consumed, ${Math.round(y.spent)} ${currency ?? ""}`.trim());
