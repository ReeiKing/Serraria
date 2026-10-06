import { ShieldAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NOMES_PAPEIS } from "@/lib/auth/papeis"
import { exigirUsuario } from "@/lib/auth/sessao"

export const metadata = { title: "Painel" }

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ "sem-permissao"?: string }>
}) {
  const usuario = await exigirUsuario()
  const { "sem-permissao": semPermissao } = await searchParams

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Olá, {usuario.nome.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Perfil: {NOMES_PAPEIS[usuario.papel]}</p>
      </div>

      {semPermissao && (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>Sem permissão</AlertTitle>
          <AlertDescription>
            Seu perfil não tem acesso à página que você tentou abrir.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Painel</CardTitle>
          <CardDescription>
            Os indicadores de compras, produção, estoque e vendas aparecem aqui quando os módulos
            estiverem prontos.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
