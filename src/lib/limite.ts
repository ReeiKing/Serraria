import "server-only"

/**
 * Limite simples de requisições por chave (ex.: IP) em memória.
 * Suficiente para um servidor único; em várias instâncias, troque por Redis/Upstash.
 */
const janelas = new Map<string, number[]>()

export function dentroDoLimite(chave: string, maximo: number, janelaMs: number): boolean {
  const agora = Date.now()
  const recentes = (janelas.get(chave) ?? []).filter((t) => agora - t < janelaMs)
  if (recentes.length >= maximo) {
    janelas.set(chave, recentes)
    return false
  }
  recentes.push(agora)
  janelas.set(chave, recentes)
  if (janelas.size > 10_000) janelas.clear() // evita crescer sem limite
  return true
}
