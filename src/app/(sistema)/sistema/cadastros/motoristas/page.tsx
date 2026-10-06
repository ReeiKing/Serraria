import { asc } from "drizzle-orm"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario, motoristas } from "@/db"

import { ListaMotoristas } from "./lista"

export const metadata = { title: "Motoristas" }

export default async function MotoristasPage() {
  const dados = await comUsuario((tx) => tx.select().from(motoristas).orderBy(asc(motoristas.nome)))
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Motoristas"
        voltar={{ href: "/sistema/cadastros", rotulo: "Cadastros" }}
      />
      <ListaMotoristas dados={dados} />
    </div>
  )
}
