/**
 * @name        Wines never tasted
 * @description Lists the wines in stock that have no tasting note yet, newest vintage first.
 * @author      PLOC
 * @version     1.0.0
 * @category    tasting
 * @permissions read
 * @sdk         1
 */

// Load every note once instead of calling getTastingNotes() for each wine.
const notes = await sdk.cellar.tastingNotes.getAll();
const tasted = new Set(notes.map(n => n.wineId).filter(id => id).toArray());

const wines = await sdk.cellar.wine.getAll();
const untasted = wines
    .filter(w => (w.bottles ?? 0) > 0 && !tasted.has(w.id))
    .sortBy("vintage", "desc");

if (untasted.isEmpty) {
    return "Every wine in stock has a tasting note";
}

return untasted
    .map(w => `${w.vintage ?? "NV"} - ${w.name} (${w.bottles} bt)`)
    .toArray();
