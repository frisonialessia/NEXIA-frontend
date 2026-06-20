import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// Tests de la lógica pura del dominio (motor, formato, simulación).
// No requieren DOM: corren en Node, rápido.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
});
