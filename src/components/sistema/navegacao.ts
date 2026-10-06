import {
  BarChart3,
  Boxes,
  Building2,
  FileText,
  Factory,
  LayoutDashboard,
  Tags,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react"

import type { Papel } from "@/lib/auth/papeis"

export type ItemMenu = {
  titulo: string
  href: string
  icone: LucideIcon
  papeis?: Papel[]
  /** Módulo ainda não construído: aparece desabilitado. */
  emBreve?: boolean
}

export const MENU: ItemMenu[] = [
  { titulo: "Painel", href: "/sistema", icone: LayoutDashboard },
  { titulo: "Entrada de toras", href: "/sistema/entradas", icone: Truck, emBreve: true },
  { titulo: "Produção", href: "/sistema/producao", icone: Factory, emBreve: true },
  { titulo: "Estoque", href: "/sistema/estoque", icone: Boxes, emBreve: true },
  {
    titulo: "Vendas e romaneios",
    href: "/sistema/vendas",
    icone: Tags,
    papeis: ["admin", "escritorio"],
    emBreve: true,
  },
  {
    titulo: "Notas fiscais",
    href: "/sistema/nfe",
    icone: FileText,
    papeis: ["admin", "escritorio"],
    emBreve: true,
  },
  { titulo: "Cadastros", href: "/sistema/cadastros", icone: Building2, emBreve: true },
  {
    titulo: "Relatórios",
    href: "/sistema/relatorios",
    icone: BarChart3,
    papeis: ["admin", "escritorio"],
    emBreve: true,
  },
  { titulo: "Usuários", href: "/sistema/usuarios", icone: Users, papeis: ["admin"], emBreve: true },
]

export function menuDoPapel(papel: Papel) {
  return MENU.filter((item) => !item.papeis || item.papeis.includes(papel))
}
