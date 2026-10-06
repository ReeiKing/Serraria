import { ImageResponse } from "next/og"

import { siteConfig } from "@/config/site"

export const alt = siteConfig.nome
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        color: "#fef3c7",
        background: "linear-gradient(135deg, #0c0a09 0%, #2a1709 50%, #4a2810 100%)",
      }}
    >
      <div style={{ fontSize: 28, color: "#fbbf24", letterSpacing: 4, textTransform: "uppercase" }}>
        Pinus · Eucalipto
      </div>
      <div style={{ fontSize: 84, fontWeight: 700, marginTop: 16 }}>{siteConfig.nome}</div>
      <div style={{ fontSize: 36, marginTop: 16, opacity: 0.8, maxWidth: 900 }}>
        {siteConfig.slogan}
      </div>
    </div>,
    size
  )
}
