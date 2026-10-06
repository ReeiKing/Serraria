"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { MENU } from "./navegacao"

export function MenuLateral({ aoNavegar }: { aoNavegar?: () => void }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Menu principal" className="flex flex-col gap-1">
      {MENU.map((item) => {
        const ativo =
          item.href === "/sistema" ? pathname === item.href : pathname.startsWith(item.href)
        const Icone = item.icone

        if (item.emBreve) {
          return (
            <span
              key={item.href}
              aria-disabled
              className="text-sidebar-foreground/45 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
            >
              <Icone className="size-4" aria-hidden />
              {item.titulo}
              <Badge variant="outline" className="ml-auto text-[10px] font-normal">
                em breve
              </Badge>
            </span>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={aoNavegar}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              ativo
                ? "text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            {ativo && (
              <motion.span
                layoutId="menu-ativo"
                className="bg-sidebar-primary absolute inset-0 rounded-lg"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icone className="relative size-4" aria-hidden />
            <span className="relative">{item.titulo}</span>
          </Link>
        )
      })}
    </nav>
  )
}
