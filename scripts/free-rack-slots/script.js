/**
 * @name        Free rack slots
 * @description Lists, for each rack, the number of free slots and the first free positions, to know where to store new bottles.
 * @author      PLOC
 * @version     1.0.0
 * @category    organization
 * @permissions read
 * @sdk         1
 */

const SHOWN = 5;
const racks = await sdk.cellar.rack.getAll();
if (racks.isEmpty) {
    return "No rack in the cellar";
}

const report = [];
for (const rack of racks.sortBy("name")) {
    const free = [];
    for (let row = 0; row < (rack.rows ?? 0); row++) {
        for (let column = 0; column < (rack.columns ?? 0); column++) {
            // A missing slot or an empty slot is free.
            const item = rack.getRackItem(row, column);
            if (!item || item.isEmpty()) {
                free.push(`R${row + 1}C${column + 1}`);
            }
        }
    }
    const first = free.slice(0, SHOWN).join(", ");
    report.push(`${rack.name}: ${free.length} free` + (free.length ? ` (${first}${free.length > SHOWN ? "..." : ""})` : ""));
}

return report;
