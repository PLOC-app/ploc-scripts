/**
 * @name        Print one rack to PDF
 * @description Lets you pick a rack, prints it with the wines it holds to a PDF, and shares it.
 * @author      PLOC
 * @version     1.0.0
 * @category    export
 * @permissions read
 * @sdk         1
 */

const racks = await sdk.cellar.rack.getAll();
if (racks.isEmpty) {
    return "No rack in the cellar";
}

const choice = await sdk.dialog.pick({
    title: "Rack to print",
    items: racks.map(r => ({ id: r.id, text: r.name ?? "Unnamed rack" })).toArray()
});
if (!choice) {
    return "Cancelled";
}

const rack = racks.find("id", choice.id);
// Racks and wines can be mixed in the ids given to createFile.
const ids = [rack.id];
for (const item of rack.rackItems ?? []) {
    const wineId = item.isNotEmpty() ? item.wine?.id : null;
    if (wineId && !ids.includes(wineId)) {
        ids.push(wineId);
    }
}

const file = await sdk.pdf.createFile(ids);
if (!file) {
    return "Print failed";
}

await sdk.ui.shareFiles(file.path);
return `${rack.name}: ${ids.length - 1} wines printed`;
