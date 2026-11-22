/**
 * @name        Share a wine card
 * @description Searches a wine and shares a short text card with its origin, color, grapes, drinking window and serving temperature.
 * @author      PLOC
 * @version     1.0.0
 * @category    misc
 * @permissions read
 * @sdk         1
 */

const text = await sdk.dialog.prompt({ message: "Wine to share", placeholder: "Name, appellation..." });
if (!text) {
    return "Cancelled";
}

const wine = await sdk.cellar.wine.findFirst(text);
if (!wine) {
    return "No wine matches " + text;
}

const [country, region, appellation, color] = [
    await wine.getCountry(), await wine.getRegion(), await wine.getAppellation(), await wine.getColor()
];
const range = (p, unit) => p && (p.from || p.to) ? `${p.from ?? "?"}-${p.to ?? "?"}${unit}` : null;
// Drinking window in years: drinkPeriod, or apogee when it is not set. service is in °C.
const drink = range((wine.drinkPeriod?.from || wine.drinkPeriod?.to) ? wine.drinkPeriod : wine.apogee, "");
const serve = range(wine.service, " °C");

const lines = [
    wine.name + (wine.vintage ? " " + wine.vintage : ""),
    wine.cuvee,
    [appellation?.name, region?.name, country?.name].filter(x => x).join(", "),
    color?.name,
    wine.grapes ? "Grapes: " + wine.grapes : null,
    wine.degree ? "Alcohol: " + wine.degree + "%" : null,
    drink ? "Drink: " + drink : null,
    serve ? "Serve at " + serve : null
].filter(x => x);

await sdk.ui.shareText(lines.join("\n"));
return lines;
