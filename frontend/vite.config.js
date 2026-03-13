import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL || "http://localhost:4000/api";
  const proxyTarget = apiUrl.replace(/\/api\/?$/, "");

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5500,
      allowedHosts: true
    },
  };
});
