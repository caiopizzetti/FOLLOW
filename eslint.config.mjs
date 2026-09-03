import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

/**
 * Flat config do ESLint 9. `next lint` foi descontinuado no Next 15.3+,
 * entao o script `npm run lint` chama o ESLint direto.
 */
const config = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // O seed e os scripts de banco sao .mjs sem tipos — nao vale exigir.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default config;
