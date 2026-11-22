# PLOC Scripts

Community library of ready-to-use scripts for [PLOC](https://www.ploc.co), the wine cellar app.

**Gallery: <https://ploc-app.github.io/ploc-scripts/>**: pick a script, tap *Run in PLOC* / *Edit in PLOC* or scan a QR code.

## Use a script

- On your phone: open the gallery, choose a script, tap **Run in PLOC** (or **Edit in PLOC** to open it in the editor).
- Or copy the content of `scripts/<name>/script.js` into the PLOC script editor.

A script can read (and sometimes change) your cellar: read it before you run it. Scripts that change data say
`@permissions write` in their header.

## Resources

- [PLOC JS SDK](https://github.com/PLOC-app/ploc-app-js-sdk): the `sdk` object, API catalog and TypeScript types used by scripts.
- [PLOC skills](https://github.com/PLOC-app/ploc-skills): the skill that lets an AI assistant write PLOC scripts and mini apps.
- [PLOC community](https://www.ploc.co/community/): ask questions and share what you build.

## Share a script

1. Write it (with the [PLOC skill](https://github.com/PLOC-app/ploc-skills) if you like) and test it in PLOC.
2. Add `scripts/<name>/script.js` starting from [`TEMPLATE.js`](TEMPLATE.js).
3. Open a pull request. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Repository

| Path | Content |
|---|---|
| `scripts/<slug>/script.js` | one script per folder, with a header (name, description, author, category...) |
| `TEMPLATE.js` | starting point for a new script |
| `tools/validate.mjs` | checks the scripts (`node tools/validate.mjs`) |
| `tools/build-site.mjs` | builds the gallery and `catalog.json` into `_site/` |
| `site/qrcode.js` | QR code library (MIT) used by the script pages |
| `.github/workflows` | `validate.yml` on every pull request, `pages.yml` publishes the gallery when `main` changes |

`catalog.json` is generated, never edited by hand. It is published at `<gallery>/catalog.json`.

### Open in PLOC

The link has the same shape as the QR codes made by the PLOC script editor:

```
ploc://automation?s=<value>   run the script
ploc://script?s=<value>       open it in the PLOC script editor
```

Each script page shows both as buttons and QR codes. `<value>` is either the base64url of the script itself, or the URL-encoded `https://` address of a `script.js`. The
app tells them apart.

### One-time setup

In the GitHub repository settings: *Pages* → source **GitHub Actions**; *Branches* → protect `main` and require a
review from Code Owners.

## License

[MIT](LICENSE)
