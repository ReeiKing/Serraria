/**
 * Decide se vale carregar a cena 3D: precisa de WebGL com GPU de verdade.
 * Renderizadores por software (SwiftShader, llvmpipe) travam a página; economia de
 * dados também desliga. Nesses casos fica a imagem estática da cena.
 */
export function podeRenderizar3D(): boolean {
  if (typeof window === "undefined") return false
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
  if (nav.connection?.saveData) return false
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl")
    if (!gl) return false
    const info = gl.getExtension("WEBGL_debug_renderer_info")
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ""
    gl.getExtension("WEBGL_lose_context")?.loseContext()
    return !/swiftshader|llvmpipe|software|basic render/i.test(renderer)
  } catch {
    return false
  }
}
