/**
 * @name        Tasting journal to CSV
 * @description Exports every tasting note (date, wine, rating, mood, place, people, comments) to a CSV file and shares it.
 * @author      PLOC
 * @version     1.0.0
 * @category    tasting
 * @permissions read
 * @sdk         1
 */

// Same order as TastingNotes.MOOD (0 to 7).
const MOODS = ["", "Nasty", "Blah", "Angry", "Banal", "Surprised", "Happy", "Love"];
const cell = v => '"' + String(v ?? "").replace(/"/g, '""') + '"';

const notes = await sdk.cellar.tastingNotes.getAll();
if (notes.isEmpty) {
    return "No tasting note to export";
}

const wines = await sdk.cellar.wine.getAll();
const byId = new Map(wines.map(w => [w.id, w]).toArray());

const rows = [["date", "wine", "vintage", "rating", "mood", "place", "people", "meals", "comments"]];
for (const n of notes.sortBy("date", "desc")) {
    const wine = byId.get(n.wineId);
    rows.push([
        n.date ? n.date.toISOString().slice(0, 10) : "",
        wine?.name,
        n.vintage || wine?.vintage,
        n.note || "",
        MOODS[n.mood] ?? "",
        n.place, n.people, n.meals, n.comments
    ]);
}

const csv = rows.map(r => r.map(cell).join(";")).join("\n");
const file = await sdk.files.writeText("tasting-journal.csv", csv);
if (!file) {
    return "Export failed";
}

await sdk.ui.shareFiles(file.path);
return notes.count + " tasting notes exported";
