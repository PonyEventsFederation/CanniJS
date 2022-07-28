# canni

Canni Discord bot for the GalaCon server!

## development

- requirements: node v18.4.0, [pnpm](https://pnpm.io)
- `pnpm i` to install dependencies
- `pnpm run build` checks the code for type errors (but doesn't actually build anything). The typescript config used is pretty strict, and will error if something is implicitly typed as `any` because lack of type annotations (in jsdoc comments)
- `pnpm run lint` lints the code
