/**
 * @name        Rack and stock mismatches
 * @description Compares the bottles in stock with the rack slots and lists the wines not fully placed or placed more than owned.
 * @author      PLOC
 * @version     1.0.0
 * @category    inventory
 * @permissions read
 * @sdk         1
 */

const racks = await sdk.cellar.rack.getAll();
if (racks.isEmpty) {
    return "No rack in the cellar";
}

// Count the filled slots of each wine, across all racks.
const slots = new Map();
for (const rack of racks) {
    for (const item of rack.rackItems ?? []) {
        const id = item.isNotEmpty() && !item.isDeleted() ? item.wine?.id : null;
        if (id) {
            slots.set(id, (slots.get(id) ?? 0) + 1);
        }
    }
}

const notPlaced = [];
const tooMany = [];
const wines = await sdk.cellar.wine.getAll();
for (const w of wines.sortBy("name")) {
    const bottles = w.bottles ?? 0;
    const placed = slots.get(w.id) ?? 0;
    const label = w.name + (w.vintage ? " " + w.vintage : "");
    if (placed > bottles) {
        tooMany.push(`${label}: ${placed} slots for ${bottles} bottles`);
    } else if (placed < bottles) {
        notPlaced.push(`${label}: ${bottles - placed} of ${bottles} bottles not in a rack`);
    }
}

return { slotsWithoutBottles: tooMany, bottlesWithoutSlot: notPlaced };
