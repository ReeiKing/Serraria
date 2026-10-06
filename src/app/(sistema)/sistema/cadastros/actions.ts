"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import {
  clientes,
  comUsuario,
  empresas,
  especies,
  fornecedores,
  motoristas,
  qualidades,
  tabelaPrecos,
  usuarios,
  veiculos,
} from "@/db"
import { executar } from "@/lib/acoes"
import { exigirUsuario } from "@/lib/auth/sessao"
import { definirAtivo, excluirRegistro, salvarRegistro } from "@/lib/crud"
import {
  clienteSchema,
  empresaSchema,
  especieSchema,
  fornecedorSchema,
  motoristaSchema,
  novoUsuarioSchema,
  precoSchema,
  qualidadeSchema,
  senhaSchema,
  veiculoSchema,
} from "@/lib/schemas/cadastros"
import { createAdminClient } from "@/lib/supabase/admin"

const BASE = "/sistema/cadastros"

// ---------------------------------------------------------------- fornecedores
export async function salvarFornecedor(id: string | null, entrada: unknown) {
  return salvarRegistro(fornecedores, fornecedorSchema, id, entrada, `${BASE}/fornecedores`)
}
export async function excluirFornecedor(id: string) {
  return excluirRegistro(fornecedores, id, `${BASE}/fornecedores`)
}
export async function ativarFornecedor(id: string, ativo: boolean) {
  return definirAtivo(fornecedores, id, ativo, `${BASE}/fornecedores`)
}

// ---------------------------------------------------------------- clientes
export async function salvarCliente(id: string | null, entrada: unknown) {
  return salvarRegistro(clientes, clienteSchema, id, entrada, `${BASE}/clientes`)
}
export async function excluirCliente(id: string) {
  return excluirRegistro(clientes, id, `${BASE}/clientes`)
}
export async function ativarCliente(id: string, ativo: boolean) {
  return definirAtivo(clientes, id, ativo, `${BASE}/clientes`)
}

// ---------------------------------------------------------------- motoristas
export async function salvarMotorista(id: string | null, entrada: unknown) {
  return salvarRegistro(motoristas, motoristaSchema, id, entrada, `${BASE}/motoristas`)
}
export async function excluirMotorista(id: string) {
  return excluirRegistro(motoristas, id, `${BASE}/motoristas`)
}
export async function ativarMotorista(id: string, ativo: boolean) {
  return definirAtivo(motoristas, id, ativo, `${BASE}/motoristas`)
}

// ---------------------------------------------------------------- veículos
export async function salvarVeiculo(id: string | null, entrada: unknown) {
  return salvarRegistro(veiculos, veiculoSchema, id, entrada, `${BASE}/veiculos`)
}
export async function excluirVeiculo(id: string) {
  return excluirRegistro(veiculos, id, `${BASE}/veiculos`)
}
export async function ativarVeiculo(id: string, ativo: boolean) {
  return definirAtivo(veiculos, id, ativo, `${BASE}/veiculos`)
}

// ---------------------------------------------------------------- espécies e qualidades
export async function salvarEspecie(id: string | null, entrada: unknown) {
  return salvarRegistro(especies, especieSchema, id, entrada, `${BASE}/especies`)
}
export async function excluirEspecie(id: string) {
  return excluirRegistro(especies, id, `${BASE}/especies`)
}
export async function ativarEspecie(id: string, ativo: boolean) {
  return definirAtivo(especies, id, ativo, `${BASE}/especies`)
}
export async function salvarQualidade(id: string | null, entrada: unknown) {
  return salvarRegistro(qualidades, qualidadeSchema, id, entrada, `${BASE}/especies`)
}
export async function excluirQualidade(id: string) {
  return excluirRegistro(qualidades, id, `${BASE}/especies`)
}
export async function ativarQualidade(id: string, ativo: boolean) {
  return definirAtivo(qualidades, id, ativo, `${BASE}/especies`)
}

// ---------------------------------------------------------------- preços
export async function salvarPreco(id: string | null, entrada: unknown) {
  return salvarRegistro(tabelaPrecos, precoSchema, id, entrada, `${BASE}/precos`)
}
export async function excluirPreco(id: string) {
  return excluirRegistro(tabelaPrecos, id, `${BASE}/precos`)
}

// ---------------------------------------------------------------- empresa
export async function salvarEmpresa(id: string | null, entrada: unknown) {
  return salvarRegistro(empresas, empresaSchema, id, entrada, `${BASE}/empresa`)
}

export async function salvarLogoEmpresa(id: string, caminho: string | null) {
  return executar(async () => {
    await comUsuario((tx) =>
      tx.update(empresas).set({ logoPath: caminho }).where(eq(empresas.id, id))
    )
    revalidatePath(`${BASE}/empresa`)
  })
}

// ---------------------------------------------------------------- usuários (Supabase Auth)
export async function criarUsuario(entrada: unknown) {
  return executar(async () => {
    await exigirUsuario()
    const dados = novoUsuarioSchema.parse(entrada)
    const { error } = await createAdminClient().auth.admin.createUser({
      email: dados.email,
      password: dados.senha,
      email_confirm: true,
      app_metadata: { nome: dados.nome },
    })
    if (error) {
      throw new Error(
        error.code === "email_exists"
          ? "Já existe um usuário com esse e-mail."
          : `Não foi possível criar: ${error.message}`
      )
    }
    revalidatePath(`${BASE}/usuarios`)
  })
}

export async function renomearUsuario(id: string, entrada: unknown) {
  return executar(async () => {
    const { nome } = novoUsuarioSchema.pick({ nome: true }).parse(entrada)
    await comUsuario((tx) => tx.update(usuarios).set({ nome }).where(eq(usuarios.id, id)))
    revalidatePath(`${BASE}/usuarios`)
  })
}

export async function trocarSenhaUsuario(id: string, entrada: unknown) {
  return executar(async () => {
    await exigirUsuario()
    const { senha } = senhaSchema.parse(entrada)
    const { error } = await createAdminClient().auth.admin.updateUserById(id, { password: senha })
    if (error) throw new Error(`Não foi possível trocar a senha: ${error.message}`)
  })
}

export async function ativarUsuario(id: string, ativo: boolean) {
  return executar(async () => {
    const eu = await exigirUsuario()
    if (eu.id === id && !ativo) throw new Error("Você não pode desativar o próprio usuário.")
    await comUsuario((tx) => tx.update(usuarios).set({ ativo }).where(eq(usuarios.id, id)))
    // Desativado, ele perde o acesso na próxima requisição (RLS + exigirUsuario).
    revalidatePath(`${BASE}/usuarios`)
  })
}
