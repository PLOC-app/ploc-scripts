/**
 * @name        Wines by vintage
 * @description Lists the wines from 2015 onwards, newest first.
 * @author      PLOC
 * @version     1.0.0
 * @category    inventory
 * @permissions read
 * @sdk         1
 */

const wines = await sdk.cellar.wine.getAll();
return wines
    .filter(w => w.vintage >= 2015)
    .sortBy("vintage", "desc")
    .map(w => w.vintage + " - " + w.name)
    .toArray();
