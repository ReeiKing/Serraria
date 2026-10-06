import {
  BarChart3,
  Boxes,
  Building2,
  FileText,
  Factory,
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
}

export const MENU: ItemMenu[] = [
  { titulo: "Painel", href: "/sistema", icone: LayoutDashboard },
  { titulo: "Entrada de toras", href: "/sistema/entradas", icone: Truck },
  { titulo: "Produção", href: "/sistema/producao", icone: Factory, emBreve: true },
  { titulo: "Estoque", href: "/sistema/estoque", icone: Boxes, emBreve: true },
  {
    titulo: "Vendas e romaneios",
    href: "/sistema/vendas",
    icone: Tags,
    emBreve: true,
  },
  {
    titulo: "Notas fiscais",
    href: "/sistema/nfe",
    icone: FileText,
    emBreve: true,
  },
  { titulo: "Cadastros", href: "/sistema/cadastros", icone: Building2 },
  {
    titulo: "Relatórios",
    href: "/sistema/relatorios",
    icone: BarChart3,
    emBreve: true,
  },
]
