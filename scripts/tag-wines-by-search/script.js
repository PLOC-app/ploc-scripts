/**
 * @name        Tag wines from a search
 * @description Adds a tag to every wine matching a search text, after confirmation, so you can group them (party, gift, to sell...).
 * @author      PLOC
 * @version     1.0.0
 * @category    organization
 * @permissions write
 * @sdk         1
 */

const text = await sdk.dialog.prompt({ message: "Wines to tag (search text)", placeholder: "Bourgogne 2018" });
if (!text) {
    return "Cancelled";
}
const tag = (await sdk.dialog.prompt({ message: "Tag to add", placeholder: "Christmas" }))?.trim();
if (!tag) {
    return "Cancelled";
}

// Tags are stored as one text: add the new one separated by a comma.
const hasTag = w => (w.tags ?? "").split(",").map(t => t.trim().toLowerCase()).includes(tag.toLowerCase());
const wines = (await sdk.cellar.wine.find(text)).filter(w => !hasTag(w));
if (wines.isEmpty) {
    return "No wine to tag";
}

const ok = await sdk.dialog.confirm({
    title: "Add a tag",
    message: `Add the tag "${tag}" to ${wines.count} wines matching "${text}"?`,
    okLabel: "Add"
});
if (!ok) {
    return "Cancelled";
}

for (const w of wines) {
    w.tags = w.tags ? w.tags + ", " + tag : tag;
    await w.save();
}

return `Tag "${tag}" added to ${wines.count} wines`;
