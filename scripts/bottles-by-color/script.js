/**
 * @name        Bottles by color
 * @description Counts the bottles in stock per wine color (red, white, rosé...) with their share of the cellar.
 * @author      PLOC
 * @version     1.0.0
 * @category    stats
 * @permissions read
 * @sdk         1
 */

// Load the colors once instead of calling getColor() for each wine.
const colors = await sdk.cellar.color.getAll();
const colorNames = new Map(colors.map(c => [c.id, c.name]).toArray());

const counts = new Map();
let total = 0;
for (const w of await sdk.cellar.wine.getAll()) {
    const bottles = w.bottles ?? 0;
    if (bottles <= 0) {
        continue;
    }
    const name = colorNames.get(w.colorId) ?? "No color";
    counts.set(name, (counts.get(name) ?? 0) + bottles);
    total += bottles;
}

if (total === 0) {
    return "No bottle in stock";
}

return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, n]) => `${name}: ${n} bottles (${Math.round(n * 100 / total)}%)`);
