/**
 * @name        Clean up wine names
 * @description Removes leading, trailing and double spaces from wine names and cuvées, after confirmation.
 * @author      PLOC
 * @version     1.0.0
 * @category    maintenance
 * @permissions write
 * @sdk         1
 */

const clean = s => typeof s === "string" ? s.replace(/\s+/g, " ").trim() : s;
const needsFix = w => clean(w.name) !== w.name || clean(w.cuvee) !== w.cuvee;

const wines = (await sdk.cellar.wine.getAll()).filter(needsFix);
if (wines.isEmpty) {
    return "Every wine name is already clean";
}

const preview = wines.toArray().slice(0, 5).map(w => `"${w.name}" -> "${clean(w.name)}"`).join("\n");
const ok = await sdk.dialog.confirm({
    title: "Clean up names",
    message: `Remove extra spaces from ${wines.count} wines?\n\n${preview}${wines.count > 5 ? "\n..." : ""}`,
    okLabel: "Clean up"
});
if (!ok) {
    return "Cancelled";
}

for (const w of wines) {
    w.name = clean(w.name);
    if (w.cuvee) {
        w.cuvee = clean(w.cuvee);
    }
    await w.save();
}

return wines.count + " wines cleaned";
