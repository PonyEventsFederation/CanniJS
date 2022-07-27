# canni

Canni Discord bot for the GalaCon server!

## development

- `npm i` to install dependencies
- `npm run build` checks the code for type errors (but doesn't actually build anything). The typescript config used is pretty strict, and will error if something is implicitly typed as `any` because lack of type annotations (in jsdoc comments)
- `npm run lint` lints the code
