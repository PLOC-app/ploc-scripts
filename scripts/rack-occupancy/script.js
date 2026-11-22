/**
 * @name        Rack occupancy
 * @description Lists how many slots are filled in each rack.
 * @author      PLOC
 * @version     1.0.0
 * @category    inventory
 * @permissions read
 * @sdk         1
 */

const racks = await sdk.cellar.rack.getAll();
const report = [];
for (const rack of racks) {
    const items = rack.rackItems ?? [];
    const filled = items.filter(item => item.isNotEmpty()).length;
    report.push(rack.name + ": " + filled + " / " + rack.rows * rack.columns);
}

return report;
