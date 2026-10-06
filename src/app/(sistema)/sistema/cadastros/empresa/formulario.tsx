"use client"

import { ImageUp, Loader2, Trash2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { CampoNumero, CampoSelect, CampoTexto, CampoTextoLongo } from "@/components/form/campos"
import { CamposEndereco } from "@/components/form/campos-endereco"
import { FormularioCadastro } from "@/components/form/formulario-cadastro"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { empresas } from "@/db/gerado/schema"
import { numeroParaCampo } from "@/lib/format"
import { REGIMES, empresaSchema } from "@/lib/schemas/cadastros"
import { createClient } from "@/lib/supabase/client"

import { salvarEmpresa, salvarLogoEmpresa } from "../actions"

type Empresa = typeof empresas.$inferSelect

function Logo({ empresaId, logoUrl }: { empresaId: string; logoUrl: string | null }) {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(arquivo: File) {
    if (arquivo.size > 2 * 1024 * 1024) {
      toast.error("O logo deve ter no máximo 2 MB.")
      return
    }
    setEnviando(true)
    try {
      const ext = arquivo.name.split(".").pop()?.toLowerCase() ?? "png"
      const caminho = `logo-${Date.now()}.${ext}`
      const { error } = await createClient()
        .storage.from("empresa")
        .upload(caminho, arquivo, { contentType: arquivo.type })
      if (error) throw error
      const r = await salvarLogoEmpresa(empresaId, caminho)
      if (!r.ok) throw new Error(r.erro)
      toast.success("Logo atualizado.")
      router.refresh()
    } catch {
      toast.error("Não foi possível enviar o logo. Use PNG, JPG, SVG ou WEBP.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo</CardTitle>
        <CardDescription>Aparece no romaneio e nos relatórios.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="bg-muted flex size-24 items-center justify-center overflow-hidden rounded-lg border">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Logo da empresa"
              width={96}
              height={96}
              className="object-contain"
              unoptimized
            />
          ) : (
            <ImageUp className="text-muted-foreground size-8" />
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && void enviar(e.target.files[0])}
        />
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => input.current?.click()}
            disabled={enviando}
          >
            {enviando ? <Loader2 className="animate-spin" /> : <ImageUp />}
            {logoUrl ? "Trocar logo" : "Enviar logo"}
          </Button>
          {logoUrl && (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              onClick={async () => {
                const r = await salvarLogoEmpresa(empresaId, null)
                if (r.ok) router.refresh()
              }}
            >
              <Trash2 />
              Remover
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string
  descricao?: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="bg-card flex flex-col gap-4 rounded-xl border p-4 md:p-6">
      <legend className="font-heading px-1 text-lg font-semibold">{titulo}</legend>
      {descricao && <p className="text-muted-foreground -mt-2 text-sm">{descricao}</p>}
      {children}
    </fieldset>
  )
}

export function FormularioEmpresa({
  empresa,
  logoUrl,
}: {
  empresa: Empresa | null
  logoUrl: string | null
}) {
  const router = useRouter()
  const e = empresa

  return (
    <div className="flex flex-col gap-6">
      {e && <Logo empresaId={e.id} logoUrl={logoUrl} />}
      <FormularioCadastro
        schema={empresaSchema}
        valoresIniciais={{
          razaoSocial: e?.razaoSocial ?? "",
          nomeFantasia: e?.nomeFantasia ?? "",
          cnpj: e?.cnpj ?? "",
          ie: e?.ie ?? "",
          im: e?.im ?? "",
          crt: String(e?.crt ?? 1) as "1",
          cep: e?.cep ?? "",
          logradouro: e?.logradouro ?? "",
          numero: e?.numero ?? "",
          complemento: e?.complemento ?? "",
          bairro: e?.bairro ?? "",
          municipio: e?.municipio ?? "",
          codigoIbge: e?.codigoIbge ?? "",
          uf: e?.uf ?? "",
          telefone: e?.telefone ?? "",
          email: e?.email ?? "",
          nfeSerie: String(e?.nfeSerie ?? 1),
          nfeProximoNumero: String(e?.nfeProximoNumero ?? 1),
          cfopInterno: e?.cfopInterno ?? "5101",
          cfopInterestadual: e?.cfopInterestadual ?? "6101",
          csosn: e?.csosn ?? "",
          cstIcms: e?.cstIcms ?? "",
          aliquotaIcms: numeroParaCampo(e?.aliquotaIcms ?? 0),
          cstPis: e?.cstPis ?? "07",
          aliquotaPis: numeroParaCampo(e?.aliquotaPis ?? 0),
          cstCofins: e?.cstCofins ?? "07",
          aliquotaCofins: numeroParaCampo(e?.aliquotaCofins ?? 0),
          informacoesComplementares: e?.informacoesComplementares ?? "",
        }}
        salvar={(v) => salvarEmpresa(e?.id ?? null, v)}
        aoConcluir={() => router.refresh()}
        mensagemSucesso="Dados da empresa salvos."
      >
        <Secao titulo="Identificação">
          <CampoTexto name="razaoSocial" label="Razão social" />
          <CampoTexto name="nomeFantasia" label="Nome fantasia" />
          <div className="grid gap-4 sm:grid-cols-3">
            <CampoTexto name="cnpj" label="CNPJ" inputMode="numeric" />
            <CampoTexto name="ie" label="Inscrição estadual" />
            <CampoTexto name="im" label="Inscrição municipal" />
            <CampoTexto name="telefone" label="Telefone" inputMode="tel" />
            <CampoTexto name="email" label="E-mail" type="email" className="sm:col-span-2" />
          </div>
        </Secao>

        <Secao titulo="Endereço">
          <CamposEndereco comIbge />
        </Secao>

        <Secao titulo="NF-e" descricao="Série e numeração da próxima nota emitida.">
          <div className="grid gap-4 sm:grid-cols-3">
            <CampoSelect
              name="crt"
              label="Regime tributário (CRT)"
              opcoes={[...REGIMES]}
              className="sm:col-span-3"
            />
            <CampoNumero name="nfeSerie" label="Série" />
            <CampoNumero name="nfeProximoNumero" label="Próximo número" />
          </div>
        </Secao>

        <Secao
          titulo="Padrões fiscais"
          descricao="Valores padrão usados ao montar a nota. Nada é fixo no sistema: confirme cada um com o contador."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <CampoTexto
              name="cfopInterno"
              label="CFOP dentro do estado"
              inputMode="numeric"
              descricao="Ex.: 5101 (venda de produção)"
            />
            <CampoTexto
              name="cfopInterestadual"
              label="CFOP fora do estado"
              inputMode="numeric"
              descricao="Ex.: 6101"
            />
            <CampoTexto
              name="csosn"
              label="CSOSN (Simples)"
              inputMode="numeric"
              descricao="Ex.: 102 ou 101"
            />
            <CampoTexto name="cstIcms" label="CST ICMS (Regime Normal)" inputMode="numeric" />
            <CampoNumero name="aliquotaIcms" label="Alíquota ICMS" sufixo="%" />
            <div className="hidden sm:block" />
            <CampoTexto name="cstPis" label="CST PIS" inputMode="numeric" />
            <CampoNumero name="aliquotaPis" label="Alíquota PIS" sufixo="%" />
            <div className="hidden sm:block" />
            <CampoTexto name="cstCofins" label="CST COFINS" inputMode="numeric" />
            <CampoNumero name="aliquotaCofins" label="Alíquota COFINS" sufixo="%" />
          </div>
          <CampoTextoLongo
            name="informacoesComplementares"
            label="Informações complementares padrão"
            descricao="Texto incluído em todas as notas (o número do romaneio é acrescentado automaticamente)."
          />
        </Secao>
      </FormularioCadastro>
    </div>
  )
}
