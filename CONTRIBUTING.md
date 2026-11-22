# Contributing a script

Thank you for sharing your script with the PLOC community. A script is plain JavaScript run by the PLOC app; the
`sdk` object is injected. Not sure how to write one? Ask an AI assistant with the
[PLOC skill](https://github.com/PLOC-app/ploc-skills), then test the result in the PLOC script editor.

## How to submit

1. Fork this repository (or use the GitHub web editor, which does it for you).
2. Create `scripts/<slug>/script.js`. The folder name is the script id: lowercase words separated by dashes
   (`export-wines-to-csv`).
3. Start from [`TEMPLATE.js`](TEMPLATE.js) and fill the header.
4. Check it locally (optional, needs Node 20+): `node tools/validate.mjs`
5. Open a pull request. The checks run automatically; a maintainer reviews the code before merging.

Once merged, your script is published on the gallery with a page, a QR code and an "Open in PLOC" link. Nothing else
to do: the catalog is rebuilt on every merge.

## The header

A comment block at the very top of `script.js`:

| Field | Required | Value |
|---|---|---|
| `@name` | yes | Short title, 60 characters max |
| `@description` | yes | One sentence |
| `@author` | yes | Your GitHub username |
| `@version` | yes | `X.Y.Z`, increase it when you change the script |
| `@category` | yes | One of `export`, `backup`, `inventory`, `tasting`, `organization`, `stats`, `sync`, `maintenance`, `misc` |
| `@permissions` | yes | `read` (does not change anything) or `write` (saves, deletes, consumes, restores, installs...) |
| `@sdk` | no | Minimum SDK `versionCode` (integer) the script needs |

## Review rules

A script can read and change the whole cellar, so every script is read by a human before it is merged.

- Plain readable code: no minified or obfuscated code, no `eval` / `Function`, `import` or `require`.
- Do not declare `sdk` or `auth`. `await` every `sdk` call.
- Anything that changes or deletes data must ask for confirmation first (`sdk.dialog.confirm`) and say what will
  change. Declare `@permissions write` for it.
- Network access (`sdk.network.*`) only when the script is about it, only to the services it announces in its
  description, and never to send cellar data to a third party.
- `sdk.storage` keys must start with the script slug.
- Keep it short: 64 KB maximum, one file.
- Do not include personal data (names, emails, tokens, URLs with secrets).

The automatic checks catch most format problems and warn about risky patterns, but they cannot prove a script is safe:
the review does.

## License

By submitting a script you agree to publish it under this repository's [MIT license](LICENSE).
