"use client"

import { Loader2, Search } from "lucide-react"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { buscarCep, buscarCodigoIbge } from "@/lib/brasilapi"
import { UFS } from "@/lib/uf"
import { soDigitos } from "@/lib/validacao"

import { CampoSelect, CampoTexto } from "./campos"

const OPCOES_UF = UFS.map((uf) => ({ valor: uf, rotulo: uf }))

/** CEP com busca automática + endereço. `prefixo` permite reutilizar (ex.: "destino"). */
export function CamposEndereco({
  comComplemento = true,
  comIbge = false,
  nomes = {},
}: {
  comComplemento?: boolean
  comIbge?: boolean
  nomes?: Partial<
    Record<
      | "cep"
      | "logradouro"
      | "numero"
      | "complemento"
      | "bairro"
      | "municipio"
      | "uf"
      | "codigoIbge",
      string
    >
  >
}) {
  const n = {
    cep: "cep",
    logradouro: "logradouro",
    numero: "numero",
    complemento: "complemento",
    bairro: "bairro",
    municipio: "municipio",
    uf: "uf",
    codigoIbge: "codigoIbge",
    ...nomes,
  }
  const { getValues, setValue } = useFormContext()
  const [buscando, setBuscando] = useState(false)

  const definir = (campo: string, valor: string) =>
    setValue(campo, valor, { shouldDirty: true, shouldValidate: valor !== "" })

  async function consultar() {
    const cep = soDigitos(getValues(n.cep))
    if (cep.length !== 8) {
      toast.error("Digite um CEP com 8 dígitos.")
      return
    }
    setBuscando(true)
    try {
      const e = await buscarCep(cep)
      definir(n.logradouro, e.logradouro)
      definir(n.bairro, e.bairro)
      definir(n.municipio, e.municipio)
      definir(n.uf, e.uf)
      if (comIbge) definir(n.codigoIbge, e.codigoIbge)
      toast.success("Endereço preenchido pelo CEP.")
    } catch (err) {
      toast.error(
        err instanceof Error && err.message === "Não encontrado."
          ? "CEP não encontrado."
          : "Não foi possível consultar o CEP."
      )
    } finally {
      setBuscando(false)
    }
  }

  async function atualizarIbge() {
    if (!comIbge) return
    const codigo = await buscarCodigoIbge(getValues(n.municipio), getValues(n.uf))
    if (codigo) definir(n.codigoIbge, codigo)
  }

  return (
    <div className="grid grid-cols-6 gap-4">
      <CampoTexto
        name={n.cep}
        label="CEP"
        inputMode="numeric"
        placeholder="00000-000"
        className="col-span-6 sm:col-span-3"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            void consultar()
          }
        }}
        acao={
          <Button
            type="button"
            variant="outline"
            onClick={consultar}
            disabled={buscando}
            aria-label="Buscar CEP"
          >
            {buscando ? <Loader2 className="animate-spin" /> : <Search />}
          </Button>
        }
      />
      <CampoTexto name={n.logradouro} label="Logradouro" className="col-span-6 sm:col-span-4" />
      <CampoTexto name={n.numero} label="Número" className="col-span-3 sm:col-span-2" />
      {comComplemento && (
        <CampoTexto name={n.complemento} label="Complemento" className="col-span-3 sm:col-span-3" />
      )}
      <CampoTexto
        name={n.bairro}
        label="Bairro"
        className={comComplemento ? "col-span-6 sm:col-span-3" : "col-span-3 sm:col-span-4"}
      />
      <CampoTexto
        name={n.municipio}
        label="Município"
        className="col-span-4"
        onBlur={atualizarIbge}
      />
      <CampoSelect
        name={n.uf}
        label="UF"
        opcoes={OPCOES_UF}
        placeholder="UF"
        className="col-span-2"
        aoMudar={() => void atualizarIbge()}
      />
      {comIbge && (
        <CampoTexto
          name={n.codigoIbge}
          label="Código IBGE do município"
          inputMode="numeric"
          descricao="Preenchido automaticamente; necessário para a NF-e."
          className="col-span-6"
        />
      )}
    </div>
  )
}
