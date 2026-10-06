import { asc } from "drizzle-orm"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario, especies, qualidades } from "@/db"

import { ListaEspecies, ListaQualidades } from "./lista"

export const metadata = { title: "Espécies e qualidades" }

export default async function EspeciesPage() {
  const [listaEspecies, listaQualidades] = await comUsuario((tx) =>
    Promise.all([
      tx.select().from(especies).orderBy(asc(especies.nome)),
      tx.select().from(qualidades).orderBy(asc(qualidades.ordem)),
    ])
  )
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <CabecalhoPagina
        titulo="Espécies e qualidades"
        descricao="Os NCMs são sugestões padrão — confirme com o contador."
        voltar={{ href: "/sistema/cadastros", rotulo: "Cadastros" }}
      />
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-semibold">Espécies</h2>
        <ListaEspecies dados={listaEspecies} />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-semibold">Qualidades</h2>
        <ListaQualidades dados={listaQualidades} />
      </section>
    </div>
  )
}
