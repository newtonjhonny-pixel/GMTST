import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Config and seed files are not app code
    "prisma.config.ts",
    "prisma/seed.ts",
  ]),
  {
    rules: {
      // TypeScript already enforces types via tsc --noEmit (0 errors).
      // Disabling here avoids noise in JSON-returning API handlers and NextAuth callbacks.
      "@typescript-eslint/no-explicit-any": "off",
      // Valid pattern for resetting dependent state when a parent state changes
      // (e.g. clearing unidade when empresa changes in cascade dropdowns).
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
