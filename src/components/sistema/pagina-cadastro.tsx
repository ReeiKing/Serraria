"use client"

import { Plus } from "lucide-react"
import { useState, type ReactNode } from "react"

import { TabelaDados, type Coluna } from "@/components/tabela/tabela-dados"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

/**
 * Lista + painel lateral de edição. Clique numa linha para editar; "Novo" abre vazio.
 * `formulario` recebe o registro (ou null para novo) e `fechar`.
 */
export function PaginaCadastro<T extends { id: string }>({
  dados,
  colunas,
  textoBusca,
  buscaPlaceholder,
  rotuloNovo = "Novo",
  tituloPainel,
  formulario,
}: {
  dados: T[]
  colunas: Coluna<T>[]
  textoBusca?: (linha: T) => string
  buscaPlaceholder?: string
  rotuloNovo?: string
  tituloPainel: (registro: T | null) => string
  formulario: (registro: T | null, fechar: () => void) => ReactNode
}) {
  const [aberto, setAberto] = useState(false)
  const [registro, setRegistro] = useState<T | null>(null)

  const abrir = (r: T | null) => {
    setRegistro(r)
    setAberto(true)
  }

  return (
    <>
      <TabelaDados
        dados={dados}
        colunas={colunas}
        textoBusca={textoBusca}
        buscaPlaceholder={buscaPlaceholder}
        aoClicarLinha={abrir}
        acoes={
          <Button size="lg" onClick={() => abrir(null)}>
            <Plus />
            {rotuloNovo}
          </Button>
        }
      />
      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="font-heading text-xl">{tituloPainel(registro)}</SheetTitle>
            <SheetDescription className="sr-only">Formulário de cadastro</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {/* key força um formulário novo a cada registro aberto */}
            <div key={registro?.id ?? "novo"}>{formulario(registro, () => setAberto(false))}</div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
