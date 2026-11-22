/**
 * @name        Cellar summary
 * @description Returns the number of bottles and wines in the cellar.
 * @author      PLOC
 * @version     1.0.0
 * @category    stats
 * @permissions read
 * @sdk         1
 */

const info = await sdk.cellar.getInfo();
if (info.empty) {
    return "Empty cellar";
}

return `${info.counts.bottles} bottles in ${info.counts.wines} wines`;
