import "server-only"

import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer"

import { formatDataHora } from "@/lib/format"
import { totais, type Relatorio } from "@/lib/relatorios"
import { ALINHA_DIREITA, formatarCelula } from "@/lib/relatorios-formato"

const s = StyleSheet.create({
  pagina: {
    padding: 24,
    paddingBottom: 36,
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: "#2b1a10",
  },
  topo: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#7a4a24",
    paddingBottom: 6,
    marginBottom: 8,
  },
  empresa: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#7a4a24" },
  titulo: { fontSize: 13, fontFamily: "Helvetica-Bold", textAlign: "right" },
  sub: { fontSize: 8, color: "#6b5a4a" },
  th: {
    flexDirection: "row",
    backgroundColor: "#f7f0e6",
    borderBottomWidth: 1,
    borderBottomColor: "#d9c7b2",
    fontFamily: "Helvetica-Bold",
    paddingVertical: 3,
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8dccd",
    paddingVertical: 2.5,
  },
  total: {
    flexDirection: "row",
    borderTopWidth: 1.5,
    borderTopColor: "#7a4a24",
    paddingVertical: 3,
    fontFamily: "Helvetica-Bold",
  },
  rodape: {
    position: "absolute",
    bottom: 14,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#6b5a4a",
  },
})

function RelatorioPdf({ r, empresa }: { r: Relatorio; empresa: string }) {
  const t = totais(r)
  // largura proporcional: texto ocupa mais que números
  const pesos = r.colunas.map((c) => (c.tipo === "texto" ? 2 : c.tipo === "datahora" ? 1.4 : 1))
  const soma = pesos.reduce((a, b) => a + b, 0)
  const largura = (i: number) => `${(pesos[i]! / soma) * 100}%`
  const celula = (i: number, tipo: string) => ({
    width: largura(i),
    paddingHorizontal: 3,
    textAlign: (ALINHA_DIREITA.has(tipo as never) ? "right" : "left") as "right" | "left",
  })

  return (
    <Document title={r.titulo} author={empresa} language="pt-BR">
      <Page size="A4" orientation="landscape" style={s.pagina}>
        <View style={s.topo} fixed>
          <View>
            <Text style={s.empresa}>{empresa}</Text>
            <Text style={s.sub}>Emitido em {formatDataHora(new Date())}</Text>
          </View>
          <View>
            <Text style={s.titulo}>{r.titulo}</Text>
            <Text style={[s.sub, { textAlign: "right" }]}>{r.subtitulo}</Text>
            <Text style={[s.sub, { textAlign: "right" }]}>{r.linhas.length} registros</Text>
          </View>
        </View>
        <View style={s.th} fixed>
          {r.colunas.map((c, i) => (
            <Text key={c.chave} style={celula(i, c.tipo)}>
              {c.rotulo}
            </Text>
          ))}
        </View>
        {r.linhas.map((l, k) => (
          <View key={k} style={s.tr} wrap={false}>
            {r.colunas.map((c, i) => (
              <Text key={c.chave} style={celula(i, c.tipo)}>
                {formatarCelula(l[c.chave], c.tipo)}
              </Text>
            ))}
          </View>
        ))}
        <View style={s.total} wrap={false}>
          {r.colunas.map((c, i) => (
            <Text key={c.chave} style={celula(i, c.tipo)}>
              {i === 0
                ? `${r.linhas.length} registros`
                : c.total
                  ? formatarCelula(t[c.chave] ?? 0, c.tipo)
                  : ""}
            </Text>
          ))}
        </View>
        <View style={s.rodape} fixed>
          <Text>{empresa}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

export function gerarRelatorioPdf(r: Relatorio, empresa: string) {
  return renderToBuffer(<RelatorioPdf r={r} empresa={empresa} />)
}
