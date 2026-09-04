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
  {
    /**
     * Nada em src/ pode ler o disco em runtime.
     *
     * Arquivos-fonte (como src/lib/db/schema.sql) nao entram no build do Next.
     * Em serverless eles simplesmente nao existem, e a leitura quebra com
     * ENOENT — foi exatamente assim que a criacao de lead quebrou em producao
     * na Vercel. Migracao e trabalho dos scripts em scripts/, que rodam com o
     * repositorio em disco. Ver docs/arquitetura.md, Decisao 9.
     */
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "node:fs",
              message:
                "Codigo de runtime nao pode ler o filesystem: arquivos-fonte nao existem no bundle serverless. Use os scripts em scripts/ para migracao.",
            },
            {
              name: "fs",
              message:
                "Codigo de runtime nao pode ler o filesystem: arquivos-fonte nao existem no bundle serverless. Use os scripts em scripts/ para migracao.",
            },
            {
              name: "node:fs/promises",
              message:
                "Codigo de runtime nao pode ler o filesystem: arquivos-fonte nao existem no bundle serverless. Use os scripts em scripts/ para migracao.",
            },
          ],
        },
      ],
    },
  },
];

export default config;
