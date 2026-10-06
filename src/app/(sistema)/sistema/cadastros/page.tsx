import {
  Building2,
  Car,
  DollarSign,
  Factory,
  IdCard,
  Package,
  TreePine,
  UserCog,
  Users,
} from "lucide-react"
import Link from "next/link"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = { title: "Cadastros" }

const ITENS = [
  {
    href: "clientes",
    titulo: "Clientes",
    descricao: "Compradores da madeira serrada (dados para NF-e)",
    icone: Users,
  },
  {
    href: "fornecedores",
    titulo: "Fornecedores",
    descricao: "Quem vende as toras",
    icone: TreePine,
  },
  {
    href: "motoristas",
    titulo: "Motoristas",
    descricao: "Motoristas das cargas de entrada e saída",
    icone: IdCard,
  },
  {
    href: "veiculos",
    titulo: "Veículos",
    descricao: "Placas, tipo e tara dos caminhões",
    icone: Car,
  },
  {
    href: "especies",
    titulo: "Espécies e qualidades",
    descricao: "Pinus, Eucalipto e as linhas 1ª/2ª/3ª",
    icone: Factory,
  },
  {
    href: "produtos",
    titulo: "Paletes e caixotes",
    descricao: "Produtos vendidos por unidade (palete PBR, descartável, caixote…)",
    icone: Package,
  },
  {
    href: "precos",
    titulo: "Tabela de preços",
    descricao: "Compra de tora e venda de serrada, com histórico",
    icone: DollarSign,
  },
  {
    href: "empresa",
    titulo: "Empresa e fiscal",
    descricao: "Dados do emitente, série da NF-e e padrões fiscais",
    icone: Building2,
  },
  { href: "usuarios", titulo: "Usuários", descricao: "Quem acessa o sistema", icone: UserCog },
]

export default function CadastrosPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Cadastros"
        descricao="Dados básicos usados nas entradas, produção, vendas e notas."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITENS.map(({ href, titulo, descricao, icone: Icone }) => (
          <Link key={href} href={`/sistema/cadastros/${href}`} className="group">
            <Card className="group-hover:border-primary/40 h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
              <CardHeader>
                <span className="bg-primary/10 text-primary mb-2 flex size-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110">
                  <Icone className="size-5" />
                </span>
                <CardTitle>{titulo}</CardTitle>
                <CardDescription>{descricao}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
