import { ZodError } from "zod"

import { SessaoExpiradaError } from "@/db"

export type Resultado<T = void> = { ok: true; dados: T } | { ok: false; erro: string }

type ErroPg = { code?: string; message?: string; constraint_name?: string; detail?: string }

function erroPostgres(e: unknown): ErroPg | null {
  // Drizzle embrulha o erro do driver em `cause`.
  let atual: unknown = e
  for (let i = 0; i < 3 && atual; i++) {
    if (
      typeof atual === "object" &&
      atual !== null &&
      "code" in atual &&
      typeof (atual as ErroPg).code === "string"
    ) {
      return atual as ErroPg
    }
    atual = (atual as { cause?: unknown }).cause
  }
  return null
}

const DUPLICADOS: Record<string, string> = {
  fornecedores_documento: "Já existe um fornecedor com esse CPF/CNPJ.",
  clientes_documento: "Já existe um cliente com esse CPF/CNPJ.",
  motoristas_cpf: "Já existe um motorista com esse CPF.",
  veiculos_placa: "Já existe um veículo com essa placa.",
  especies_nome: "Já existe uma espécie com esse nome.",
  qualidades_ordem: "Já existe uma qualidade nessa posição.",
  tabela_precos_vigencia: "Já existe um preço para esse item com a mesma data de vigência.",
  estoque_itens_bitola: "Esse item de estoque já existe.",
}

/** Traduz qualquer erro para uma mensagem que a usuária entende. */
export function mensagemErro(e: unknown): string {
  if (e instanceof SessaoExpiradaError) return e.message
  if (e instanceof ZodError) return e.issues[0]?.message ?? "Verifique os campos do formulário."

  const pg = erroPostgres(e)
  if (pg) {
    switch (pg.code) {
      case "23505":
        return (
          (pg.constraint_name && DUPLICADOS[pg.constraint_name]) ??
          "Já existe um registro com esses dados."
        )
      case "23503":
        return "Este registro está sendo usado em outros lançamentos e não pode ser excluído. Você pode desativá-lo."
      case "23514":
        return "Algum valor está fora do permitido. Confira os campos."
      case "42501":
        return "Você não tem permissão para esta operação."
      case "P0001":
        return pg.message ?? "Operação não permitida."
    }
  }

  console.error(e)
  return "Não foi possível concluir a operação. Tente novamente."
}

/** Executa uma ação do servidor e devolve sucesso/erro sem lançar exceção para o cliente. */
export async function executar<T>(fn: () => Promise<T>): Promise<Resultado<T>> {
  try {
    return { ok: true, dados: await fn() }
  } catch (e) {
    // redirect()/notFound() do Next precisam continuar propagando
    if (
      e &&
      typeof e === "object" &&
      "digest" in e &&
      String((e as { digest: unknown }).digest).startsWith("NEXT_")
    )
      throw e
    return { ok: false, erro: mensagemErro(e) }
  }
}
