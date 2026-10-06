import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { exigirUsuario } from "@/lib/auth/sessao"

export const metadata = { title: "Painel" }

export default async function PainelPage() {
  const usuario = await exigirUsuario()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <h1 className="font-heading text-3xl font-semibold">Olá, {usuario.nome.split(" ")[0]}</h1>

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
