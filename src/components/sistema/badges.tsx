import { CheckCircle2, CircleDashed, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const PAGAMENTO = {
  pendente: {
    rotulo: "Pendente",
    icone: Clock,
    suave: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
    forte: "bg-amber-400 text-amber-950",
  },
  parcial: {
    rotulo: "Pago parcial",
    icone: CircleDashed,
    suave: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200",
    forte: "bg-sky-400 text-sky-950",
  },
  pago: {
    rotulo: "Pago",
    icone: CheckCircle2,
    suave: "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950",
    forte: "bg-emerald-500 text-white shadow-md shadow-emerald-950/30",
  },
} as const

/**
 * Situação do pagamento ao fornecedor. `forte` é para fundos escuros (ex.: cartão marrom
 * do resumo da entrada); o padrão serve para fundos claros (listas).
 */
export function BadgePagamento({
  status,
  forte,
  className,
}: {
  status: string
  forte?: boolean
  className?: string
}) {
  const s = PAGAMENTO[status as keyof typeof PAGAMENTO]
  if (!s) return <Badge variant="secondary">{status}</Badge>
  const Icone = s.icone
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 font-semibold",
        forte ? s.forte : s.suave,
        forte && "px-2.5 py-1 text-sm",
        className
      )}
    >
      <Icone className={forte ? "size-4" : "size-3.5"} />
      {s.rotulo}
    </Badge>
  )
}
