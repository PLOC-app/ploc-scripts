/**
 * @name        Wines of a birth year
 * @description Asks for a year (a birth, a wedding...) and lists the wines in stock of that vintage.
 * @author      PLOC
 * @version     1.0.0
 * @category    misc
 * @permissions read
 * @sdk         1
 */

const answer = await sdk.dialog.prompt({ message: "Vintage to look for", placeholder: "1990" });
if (!answer) {
    return "Cancelled";
}

const year = parseInt(answer, 10);
if (!(year > 1800 && year <= new Date().getFullYear())) {
    return "Not a valid year: " + answer;
}

const wines = (await sdk.cellar.wine.getAll())
    .filter(w => w.vintage === year && (w.bottles ?? 0) > 0)
    .sortBy("name");

if (wines.isEmpty) {
    return "No wine from " + year + " in stock";
}

return wines.map(w => `${w.name} (${w.bottles} bt)`).toArray();
