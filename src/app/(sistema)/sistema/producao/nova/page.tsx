import { sql } from "drizzle-orm"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario, estoqueItens } from "@/db"
import { opcoesCadastros } from "@/lib/consultas/opcoes"
import { agoraSP } from "@/lib/format"
import { format } from "date-fns"

import { FormularioProducao } from "../formulario"

export const metadata = { title: "Lançar produção" }

export default async function NovaProducaoPage() {
  const { opcoes, bitolas, toras } = await comUsuario(async (tx) => {
    const [opcoes, bitolas, toras] = await Promise.all([
      opcoesCadastros(tx),
      tx
        .select({
          especieId: estoqueItens.especieId,
          qualidadeId: estoqueItens.qualidadeId,
          espessuraCm: estoqueItens.espessuraCm,
          larguraCm: estoqueItens.larguraCm,
          comprimentoM: estoqueItens.comprimentoM,
          saldoPecas: estoqueItens.saldoPecas,
        })
        .from(estoqueItens)
        .orderBy(estoqueItens.espessuraCm, estoqueItens.larguraCm, estoqueItens.comprimentoM),
      tx.execute<{ especie_id: string; saldo_m3: string }>(
        sql`select especie_id, saldo_m3 from public.estoque_toras_equivalente`
      ),
    ])
    return { opcoes, bitolas, toras }
  })
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Lançar produção"
        voltar={{ href: "/sistema/producao", rotulo: "Produção" }}
      />
      <FormularioProducao
        especies={opcoes.especies}
        qualidades={opcoes.qualidades}
        bitolas={bitolas}
        torasPorEspecie={Object.fromEntries(toras.map((t) => [t.especie_id, Number(t.saldo_m3)]))}
        hoje={format(agoraSP(), "yyyy-MM-dd")}
      />
    </div>
  )
}
