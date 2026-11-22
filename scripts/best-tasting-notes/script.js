/**
 * @name        Best tasting notes
 * @description Returns the 10 best rated tasting notes with the wine, the date and the place.
 * @author      PLOC
 * @version     1.0.0
 * @category    tasting
 * @permissions read
 * @sdk         1
 */

const TOP = 10;
const notes = await sdk.cellar.tastingNotes.getAll();
const best = notes
    .filter(n => (n.note ?? 0) > 0)
    .sortBy("note", "desc")
    .toArray()
    .slice(0, TOP);

if (best.length === 0) {
    return "No rated tasting note yet";
}

// Load the wine names once.
const wines = await sdk.cellar.wine.getAll();
const names = new Map(wines.map(w => [w.id, w.name + (w.vintage ? " " + w.vintage : "")]).toArray());

return best.map(n => {
    const date = n.date ? n.date.toISOString().slice(0, 10) : "no date";
    const place = n.place ? ", " + n.place : "";
    return `${n.note} - ${names.get(n.wineId) ?? "Unknown wine"} (${date}${place})`;
});
