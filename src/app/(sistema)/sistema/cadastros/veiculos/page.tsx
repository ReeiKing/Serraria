import { asc, eq } from "drizzle-orm"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario, motoristas, veiculos } from "@/db"

import { ListaVeiculos } from "./lista"

export const metadata = { title: "Veículos" }

export default async function VeiculosPage() {
  const [dados, listaMotoristas] = await comUsuario((tx) =>
    Promise.all([
      tx.select().from(veiculos).orderBy(asc(veiculos.placa)),
      tx
        .select({ id: motoristas.id, nome: motoristas.nome })
        .from(motoristas)
        .where(eq(motoristas.ativo, true))
        .orderBy(asc(motoristas.nome)),
    ])
  )
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Veículos"
        voltar={{ href: "/sistema/cadastros", rotulo: "Cadastros" }}
      />
      <ListaVeiculos dados={dados} motoristas={listaMotoristas} />
    </div>
  )
}
