/**
 * @name        Short title of the script
 * @description One sentence saying what the script does and what it returns.
 * @author      your-github-username
 * @version     1.0.0
 * @category    misc
 * @permissions read
 * @sdk         1
 */

// `sdk` is injected by PLOC: never declare it (nor `auth`).
// Top-level `await` works and what the script `return`s is its result.
const wines = await sdk.cellar.wine.getAll();
return wines.count + " wines";
