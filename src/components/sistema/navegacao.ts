import {
  BarChart3,
  Boxes,
  Building2,
  FileText,
  Factory,
  History,
  Inbox,
  LayoutDashboard,
  Tags,
  Truck,
  type LucideIcon,
} from "lucide-react"

export type ItemMenu = {
  titulo: string
  href: string
  icone: LucideIcon
  /** Módulo ainda não construído: aparece desabilitado. */
  emBreve?: boolean
  /** Chave de um contador exibido ao lado (ex.: orçamentos novos). */
  contador?: "orcamentos"
}

export const MENU: ItemMenu[] = [
  { titulo: "Painel", href: "/sistema", icone: LayoutDashboard },
  { titulo: "Entrada de toras", href: "/sistema/entradas", icone: Truck },
  { titulo: "Produção", href: "/sistema/producao", icone: Factory },
  { titulo: "Estoque", href: "/sistema/estoque", icone: Boxes },
  {
    titulo: "Vendas e romaneios",
    href: "/sistema/vendas",
    icone: Tags,
  },
  {
    titulo: "Notas fiscais",
    href: "/sistema/nfe",
    icone: FileText,
    emBreve: true,
  },
  {
    titulo: "Orçamentos do site",
    href: "/sistema/orcamentos",
    icone: Inbox,
    contador: "orcamentos",
  },
  { titulo: "Cadastros", href: "/sistema/cadastros", icone: Building2 },
  {
    titulo: "Relatórios",
    href: "/sistema/relatorios",
    icone: BarChart3,
  },
  { titulo: "Auditoria", href: "/sistema/auditoria", icone: History },
]
