import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const PAGAMENTO: Record<string, { rotulo: string; classe: string }> = {
  pendente: { rotulo: "Pendente", classe: "bg-alerta/20 text-amber-800 dark:text-amber-200" },
  parcial: { rotulo: "Pago parcial", classe: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  pago: { rotulo: "Pago", classe: "bg-floresta/15 text-floresta" },
}

export function BadgePagamento({ status }: { status: string }) {
  const s = PAGAMENTO[status] ?? { rotulo: status, classe: "" }
  return (
    <Badge variant="secondary" className={cn("font-medium", s.classe)}>
      {s.rotulo}
    </Badge>
  )
}
