/**
 * @name        Find duplicate wines
 * @description Lists the wines entered more than once (same name, cuvée and vintage, ignoring case and extra spaces).
 * @author      PLOC
 * @version     1.0.0
 * @category    maintenance
 * @permissions read
 * @sdk         1
 */

const normalize = s => (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();

const groups = new Map();
for (const w of await sdk.cellar.wine.getAll()) {
    const key = [normalize(w.name), normalize(w.cuvee), w.vintage ?? ""].join("|");
    const group = groups.get(key) ?? [];
    group.push(w);
    groups.set(key, group);
}

const duplicates = [...groups.values()]
    .filter(group => group.length > 1)
    .map(group => {
        const w = group[0];
        const bottles = group.map(x => x.bottles ?? 0).join(" + ");
        return `${w.name}${w.vintage ? " " + w.vintage : ""}: ${group.length} entries (${bottles} bottles)`;
    });

return duplicates.length ? duplicates : "No duplicate wine found";
