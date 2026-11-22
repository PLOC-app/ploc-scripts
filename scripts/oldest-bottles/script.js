/**
 * @name        Oldest bottles
 * @description Lists the 10 oldest vintages in stock with the racks and positions where their bottles are stored.
 * @author      PLOC
 * @version     1.0.0
 * @category    inventory
 * @permissions read
 * @sdk         1
 */

// Wines in stock with a vintage (non-vintage wines are ignored), oldest first.
const wines = await sdk.cellar.wine.getAll();
const oldest = wines
    .filter(w => (w.bottles ?? 0) > 0 && w.vintage > 0)
    .toArray()
    .sort((a, b) => a.vintage - b.vintage)
    .slice(0, 10);

if (oldest.length === 0) {
    return "No vintage wine in stock";
}

const result = [];
for (const wine of oldest) {
    const places = [];
    for (const rack of await wine.getRacks()) {
        for (const item of rack.rackItems ?? []) {
            if (item.isNotEmpty() && item.wine?.id === wine.id) {
                // Positions are 0-based in the SDK: show them 1-based.
                places.push(`${rack.name} row ${item.row + 1}, column ${item.column + 1}`);
            }
        }
    }
    result.push(`${wine.vintage} - ${wine.name} (${wine.bottles} bt): ` + (places.length ? places.join(" | ") : "not in a rack"));
}

return result;
