import { NextResponse } from "next/server"

import { comUsuario } from "@/db"
import { carregarVenda } from "@/lib/consultas/venda"
import { gerarRomaneioPdf } from "@/lib/pdf/romaneio"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const venda = await comUsuario((tx) => carregarVenda(tx, id)).catch(() => null)
  if (!venda) return NextResponse.json({ erro: "Venda não encontrada" }, { status: 404 })
  if (!venda.romaneio)
    return NextResponse.json({ erro: "Confirme a venda para gerar o romaneio" }, { status: 409 })

  let logo: Buffer | null = null
  if (venda.empresa?.logoPath && !venda.empresa.logoPath.endsWith(".svg")) {
    const supabase = await createClient()
    const { data } = await supabase.storage.from("empresa").download(venda.empresa.logoPath)
    if (data) logo = Buffer.from(await data.arrayBuffer())
  }

  const pdf = await gerarRomaneioPdf(venda, logo)
  const nome = `romaneio-${String(venda.romaneio.numero).padStart(6, "0")}.pdf`
  const baixar = new URL(request.url).searchParams.has("baixar")
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${baixar ? "attachment" : "inline"}; filename="${nome}"`,
      "Cache-Control": "private, no-store",
    },
  })
}
