import { asc, desc } from "drizzle-orm"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario, especies, qualidades, tabelaPrecos } from "@/db"
import { precosVigentes } from "@/lib/precos"

import { ListaPrecos } from "./lista"

export const metadata = { title: "Tabela de preços" }

export default async function PrecosPage() {
  const [precos, listaEspecies, listaQualidades, vigentes] = await comUsuario((tx) =>
    Promise.all([
      tx
        .select()
        .from(tabelaPrecos)
        .orderBy(desc(tabelaPrecos.vigenciaInicio), desc(tabelaPrecos.createdAt)),
      tx
        .select({ id: especies.id, nome: especies.nome })
        .from(especies)
        .orderBy(asc(especies.nome)),
      tx
        .select({ id: qualidades.id, nome: qualidades.nome })
        .from(qualidades)
        .orderBy(asc(qualidades.ordem)),
      precosVigentes(tx),
    ])
  )
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Tabela de preços"
        descricao="Para mudar um preço, lance um novo com a data de vigência — o histórico é mantido e o mais recente vale a partir da data."
        voltar={{ href: "/sistema/cadastros", rotulo: "Cadastros" }}
      />
      <ListaPrecos
        dados={precos}
        especies={listaEspecies}
        qualidades={listaQualidades}
        idsVigentes={vigentes.map((v) => v.id)}
      />
    </div>
  )
}
