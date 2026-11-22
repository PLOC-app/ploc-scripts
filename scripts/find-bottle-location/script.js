/**
 * @name        Where is this bottle?
 * @description Searches a wine and returns the racks and positions (row, column) where its bottles are stored.
 * @author      PLOC
 * @version     1.0.0
 * @category    inventory
 * @permissions read
 * @sdk         1
 */

const text = await sdk.dialog.prompt({ message: "Wine to locate", placeholder: "Name, appellation, vintage..." });
if (!text) {
    return "Cancelled";
}

const wines = (await sdk.cellar.wine.find(text)).filter(w => (w.bottles ?? 0) > 0);
if (wines.isEmpty) {
    return "No wine in stock matches " + text;
}

const result = [];
// Limit to the first 10 matches: each wine loads its racks.
for (const wine of wines.toArray().slice(0, 10)) {
    const places = [];
    for (const rack of await wine.getRacks()) {
        for (const item of rack.rackItems ?? []) {
            if (item.isNotEmpty() && item.wine?.id === wine.id) {
                // Positions are 0-based in the SDK: show them 1-based.
                places.push(`${rack.name} row ${item.row + 1}, column ${item.column + 1}`);
            }
        }
    }
    const label = wine.name + (wine.vintage ? " " + wine.vintage : "");
    result.push(`${label} (${wine.bottles} bt): ` + (places.length ? places.join(" | ") : "not in a rack"));
}

return result;
