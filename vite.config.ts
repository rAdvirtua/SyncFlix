import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { MochaEnv, mochaPlugins } from "@getmocha/vite-plugins";
import path from "path";

export default defineConfig({
  plugins: [...mochaPlugins(process.env as unknown as MochaEnv), react()],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
      "@pages": path.resolve(__dirname, "src/pages"),
    },
  },
  build: {
    outDir: 'dist', // Ensures that Vite outputs the build to the 'dist' folder
  },
  server: {
    port: 3000,
    allowedHosts: true,
  },
});
