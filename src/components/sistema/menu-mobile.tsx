"use client"

import { Menu } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import { MenuLateral } from "./menu-lateral"

export function MenuMobile({ nomeEmpresa }: { nomeEmpresa: string }) {
  const [aberto, setAberto] = useState(false)

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-sidebar w-72 p-4">
        <SheetHeader className="px-0">
          <SheetTitle className="font-heading text-lg">{nomeEmpresa}</SheetTitle>
        </SheetHeader>
        <MenuLateral aoNavegar={() => setAberto(false)} />
      </SheetContent>
    </Sheet>
  )
}
