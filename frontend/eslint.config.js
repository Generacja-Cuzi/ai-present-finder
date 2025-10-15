import { solvro } from "@solvro/config/eslint";

export default [
  ...solvro(),
  {
    ignores: [
      "src/lib/api/types.ts", // Auto-generated OpenAPI types
    ],
  },
];
