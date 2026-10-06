import "server-only"

import { Document, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer"

import type { VendaCompleta } from "@/lib/consultas/venda"
import { TIPOS_VEICULO } from "@/lib/schemas/cadastros"
import {
  formatBitola,
  formatCep,
  formatDataHora,
  formatDocumento,
  formatM3,
  formatMoeda,
  formatNumero,
  formatPlaca,
  formatTelefone,
} from "@/lib/format"

const COR = {
  madeira: "#7a4a24",
  escuro: "#2b1a10",
  borda: "#d9c7b2",
  fundo: "#f7f0e6",
  cinza: "#6b5a4a",
}

const s = StyleSheet.create({
  pagina: { padding: 28, fontSize: 9, fontFamily: "Helvetica", color: COR.escuro },
  topo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: COR.madeira,
    paddingBottom: 10,
  },
  empresa: { flexDirection: "row", gap: 10, maxWidth: "62%" },
  logo: { width: 52, height: 52, objectFit: "contain" },
  nomeEmpresa: { fontSize: 13, fontFamily: "Helvetica-Bold", color: COR.madeira },
  titulo: { fontSize: 16, fontFamily: "Helvetica-Bold", textAlign: "right" },
  numero: { fontSize: 22, fontFamily: "Helvetica-Bold", color: COR.madeira, textAlign: "right" },
  pequeno: { fontSize: 8, color: COR.cinza },
  bloco: { marginTop: 10, borderWidth: 1, borderColor: COR.borda, borderRadius: 4, padding: 8 },
  blocoTitulo: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COR.madeira,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  linha: { flexDirection: "row", gap: 12 },
  campo: { flexGrow: 1 },
  rotulo: { fontSize: 7, color: COR.cinza },
  valor: { fontSize: 9.5 },
  tabela: { marginTop: 10, borderWidth: 1, borderColor: COR.borda, borderRadius: 4 },
  th: {
    flexDirection: "row",
    backgroundColor: COR.fundo,
    borderBottomWidth: 1,
    borderBottomColor: COR.borda,
    paddingVertical: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COR.borda,
    paddingVertical: 4,
  },
  totais: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8, gap: 18 },
  totalDestaque: { fontSize: 13, fontFamily: "Helvetica-Bold", color: COR.madeira },
  nfe: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: COR.madeira,
    borderRadius: 4,
    padding: 8,
    backgroundColor: COR.fundo,
  },
  chave: { fontFamily: "Courier-Bold", fontSize: 10, letterSpacing: 0.5, marginTop: 2 },
  assinaturas: { flexDirection: "row", gap: 30, marginTop: 40 },
  assinatura: {
    flexGrow: 1,
    borderTopWidth: 1,
    borderTopColor: COR.escuro,
    paddingTop: 4,
    textAlign: "center",
    fontSize: 8,
  },
  rodape: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: COR.cinza,
  },
})

const COLS = [
  { k: "especie", t: "Item", w: "13%" },
  { k: "qualidade", t: "Qualidade", w: "12%" },
  { k: "bitola", t: "Medida", w: "22%" },
  { k: "qtd", t: "Qtd.", w: "10%", dir: true },
  { k: "m3", t: "m³", w: "13%", dir: true },
  { k: "preco", t: "Preço", w: "14%", dir: true },
  { k: "total", t: "Total", w: "16%", dir: true },
] as const

function Campo({
  rotulo,
  valor,
  largura,
}: {
  rotulo: string
  valor?: string | null
  largura?: string
}) {
  return (
    <View style={[s.campo, largura ? { width: largura, flexGrow: 0 } : {}]}>
      <Text style={s.rotulo}>{rotulo}</Text>
      <Text style={s.valor}>{valor || "—"}</Text>
    </View>
  )
}

/** Chave de acesso em grupos de 4 dígitos. */
const formatChave = (c: string) => c.replace(/(\d{4})(?=\d)/g, "$1 ")

const FRETE: Record<string, string> = {
  cif: "CIF (emitente)",
  fob: "FOB (destinatário)",
  sem_frete: "Sem frete",
}

function Romaneio({ v, logo }: { v: VendaCompleta; logo: Buffer | null }) {
  const e = v.empresa
  const venda = v.venda
  const c = v.cliente
  const nota = v.notaAutorizada
  const destino = [
    [venda.destinoLogradouro, venda.destinoNumero].filter(Boolean).join(", "),
    venda.destinoComplemento,
    venda.destinoBairro,
    [venda.destinoMunicipio, venda.destinoUf].filter(Boolean).join("/"),
    venda.destinoCep ? `CEP ${formatCep(venda.destinoCep)}` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <Document
      title={`Romaneio ${v.romaneio?.numero ?? ""}`}
      author={e?.razaoSocial ?? ""}
      language="pt-BR"
    >
      <Page size="A4" style={s.pagina}>
        <View style={s.topo}>
          <View style={s.empresa}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- Image do react-pdf não tem alt */}
            {logo && <Image src={logo} style={s.logo} />}
            <View>
              <Text style={s.nomeEmpresa}>{e?.nomeFantasia || e?.razaoSocial}</Text>
              <Text>{e?.razaoSocial}</Text>
              <Text style={s.pequeno}>
                CNPJ {formatDocumento(e?.cnpj)} {e?.ie ? `· IE ${e.ie}` : ""}
              </Text>
              <Text style={s.pequeno}>
                {[e?.logradouro, e?.numero].filter(Boolean).join(", ")} · {e?.municipio}/{e?.uf}
              </Text>
              <Text style={s.pequeno}>
                {[formatTelefone(e?.telefone), e?.email].filter(Boolean).join(" · ")}
              </Text>
            </View>
          </View>
          <View>
            <Text style={s.titulo}>ROMANEIO DE CARGA</Text>
            <Text style={s.numero}>Nº {String(v.romaneio?.numero ?? "—").padStart(6, "0")}</Text>
            <Text style={[s.pequeno, { textAlign: "right" }]}>Venda nº {venda.numero}</Text>
            <Text style={[s.pequeno, { textAlign: "right" }]}>
              Emitido em {v.romaneio ? formatDataHora(v.romaneio.emitidoEm) : "—"}
            </Text>
          </View>
        </View>

        <View style={s.bloco}>
          <Text style={s.blocoTitulo}>Cliente</Text>
          <View style={s.linha}>
            <Campo rotulo="Razão social / nome" valor={c.razaoSocial} largura="50%" />
            <Campo rotulo="CNPJ / CPF" valor={formatDocumento(c.documento)} />
            <Campo rotulo="IE" valor={c.ie} />
          </View>
          <View style={[s.linha, { marginTop: 4 }]}>
            <Campo rotulo="Destino da carga" valor={destino} />
          </View>
        </View>

        <View style={s.bloco}>
          <Text style={s.blocoTitulo}>Transporte</Text>
          <View style={s.linha}>
            <Campo rotulo="Motorista" valor={v.motorista?.nome} largura="34%" />
            <Campo
              rotulo="CPF"
              valor={v.motorista?.cpf ? formatDocumento(v.motorista.cpf) : null}
            />
            <Campo rotulo="Placa" valor={formatPlaca(venda.placa)} />
            <Campo
              rotulo="Veículo"
              valor={TIPOS_VEICULO.find((t) => t.valor === v.veiculo?.tipo)?.rotulo}
            />
            <Campo rotulo="Frete" valor={FRETE[venda.tipoFrete]} />
          </View>
        </View>

        <View style={s.tabela}>
          <View style={s.th}>
            {COLS.map((col) => (
              <Text
                key={col.k}
                style={{
                  width: col.w,
                  paddingHorizontal: 4,
                  textAlign: "dir" in col ? "right" : "left",
                }}
              >
                {col.t}
              </Text>
            ))}
          </View>
          {v.itens.map((i) => {
            const cel: Record<string, string> =
              i.unidade === "UN"
                ? {
                    especie: i.produto ?? "",
                    qualidade: "—",
                    bitola: i.dimensoes ?? "",
                    qtd: `${i.quantidade.toLocaleString("pt-BR")} un.`,
                    m3: "—",
                    preco: `${formatMoeda(i.precoUnitario)}/un.`,
                    total: formatMoeda(i.valorTotal),
                  }
                : {
                    especie: i.especie ?? "",
                    qualidade: i.qualidade ?? "",
                    bitola: `${formatBitola(i.espessuraCm ?? 0, i.larguraCm ?? 0, i.comprimentoM ?? 0)} m`,
                    qtd: i.quantidade.toLocaleString("pt-BR"),
                    m3: formatM3(i.volumeM3),
                    preco: formatMoeda(i.precoM3),
                    total: formatMoeda(i.valorTotal),
                  }
            return (
              <View key={i.id} style={s.tr} wrap={false}>
                {COLS.map((col) => (
                  <Text
                    key={col.k}
                    style={{
                      width: col.w,
                      paddingHorizontal: 4,
                      textAlign: "dir" in col ? "right" : "left",
                    }}
                  >
                    {cel[col.k]}
                  </Text>
                ))}
              </View>
            )
          })}
        </View>

        <View style={s.totais}>
          {venda.totalPecas > 0 && (
            <Campo
              rotulo="Peças de madeira"
              valor={venda.totalPecas.toLocaleString("pt-BR")}
              largura="75pt"
            />
          )}
          {venda.totalPecas > 0 && (
            <Campo
              rotulo="Volume total"
              valor={`${formatNumero(venda.totalM3, 3, 6)} m³`}
              largura="80pt"
            />
          )}
          {venda.totalUnidades > 0 && (
            <Campo
              rotulo="Unidades"
              valor={venda.totalUnidades.toLocaleString("pt-BR")}
              largura="60pt"
            />
          )}
          <Campo rotulo="Produtos" valor={formatMoeda(venda.valorProdutos)} largura="80pt" />
          {Number(venda.valorFrete) > 0 && (
            <Campo rotulo="Frete" valor={formatMoeda(venda.valorFrete)} largura="70pt" />
          )}
          {Number(venda.desconto) > 0 && (
            <Campo rotulo="Desconto" valor={`− ${formatMoeda(venda.desconto)}`} largura="70pt" />
          )}
          <View>
            <Text style={s.rotulo}>Valor total</Text>
            <Text style={s.totalDestaque}>{formatMoeda(venda.valorTotal)}</Text>
          </View>
        </View>

        {nota && nota.chave && (
          <View style={s.nfe}>
            <Text style={s.blocoTitulo}>Nota fiscal eletrônica</Text>
            <View style={s.linha}>
              <Campo rotulo="NF-e nº" valor={String(nota.numero)} largura="70pt" />
              <Campo rotulo="Série" valor={String(nota.serie)} largura="50pt" />
              <Campo rotulo="Protocolo de autorização" valor={nota.protocolo} />
              <Campo
                rotulo="Autorizada em"
                valor={nota.autorizadaEm ? formatDataHora(nota.autorizadaEm) : null}
              />
            </View>
            <Text style={[s.rotulo, { marginTop: 4 }]}>Chave de acesso</Text>
            <Text style={s.chave}>{formatChave(nota.chave)}</Text>
          </View>
        )}

        {(venda.observacoes || venda.documentoFlorestal) && (
          <View style={s.bloco}>
            <Text style={s.blocoTitulo}>Observações</Text>
            {venda.documentoFlorestal && (
              <Text>Documento florestal / ambiental: {venda.documentoFlorestal}</Text>
            )}
            {venda.observacoes && <Text>{venda.observacoes}</Text>}
          </View>
        )}

        <View style={s.assinaturas} wrap={false}>
          <Text style={s.assinatura}>
            Motorista{v.motorista?.nome ? ` — ${v.motorista.nome}` : ""}
          </Text>
          <Text style={s.assinatura}>Conferente</Text>
          <Text style={s.assinatura}>Recebedor (data e assinatura)</Text>
        </View>

        <View style={s.rodape} fixed>
          <Text>Madeira de floresta plantada. Confira as peças na descarga.</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

export function gerarRomaneioPdf(v: VendaCompleta, logo: Buffer | null) {
  return renderToBuffer(<Romaneio v={v} logo={logo} />)
}
