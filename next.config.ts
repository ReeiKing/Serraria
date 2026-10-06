import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // react-pdf roda no servidor (romaneio/DANFE) e não deve ser empacotado
  serverExternalPackages: ["@react-pdf/renderer"],
}

export default nextConfig
