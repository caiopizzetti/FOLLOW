import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @libsql/client carrega bindings nativos opcionais; mantê-lo externo evita
  // que o bundler tente empacotá-los.
  serverExternalPackages: ["@libsql/client"],
};

export default nextConfig;
