import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { STATUS_VENDA } from "@/lib/vendas"

export function BadgeVenda({ status }: { status: keyof typeof STATUS_VENDA }) {
  const s = STATUS_VENDA[status]
  return (
    <Badge variant="secondary" className={cn("font-medium", s.classe)}>
      {s.rotulo}
    </Badge>
  )
}
