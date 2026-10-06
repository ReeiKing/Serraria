import { Badge } from "@/components/ui/badge"

export function BadgeAtivo({ ativo }: { ativo: boolean }) {
  return ativo ? (
    <Badge variant="secondary" className="bg-floresta/15 text-floresta">
      Ativo
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Inativo
    </Badge>
  )
}
