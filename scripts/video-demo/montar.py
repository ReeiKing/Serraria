"""
Gera o vídeo demonstrativo narrado (macOS: usa a voz "Luciana" do `say` e o ffmpeg).

Pré-requisitos: site rodando em http://localhost:3000 (npm run apresentacao), banco com os
dados de simulação (npm run db:reset), Google Chrome instalado e `brew install ffmpeg`.

Uso (na raiz do projeto):  python3 scripts/video-demo/montar.py
Saída: apresentacao/demo-serraria-modelo.mp4 e a versão leve para WhatsApp.
O roteiro (falas e legendas) fica em scripts/video-demo/roteiro.json.
"""
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

raiz = Path(__file__).resolve().parents[2]
aqui = Path(__file__).resolve().parent
trab = Path(tempfile.mkdtemp(prefix="video-demo-"))
(trab / "audio").mkdir()
shutil.copy(aqui / "roteiro.json", trab / "roteiro.json")


def duracao(arquivo):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(arquivo)], capture_output=True, text=True, check=True)
    return float(r.stdout)


# 1. narração de cada trecho
roteiro = json.loads((trab / "roteiro.json").read_text())
duracoes = {}
for t in roteiro:
    a = trab / "audio" / f"{t['id']}.aiff"
    subprocess.run(["say", "-v", "Luciana", "-r", "176", "-o", str(a), t["fala"]], check=True)
    duracoes[t["id"]] = round(duracao(a), 2)
(trab / "duracoes.json").write_text(json.dumps(duracoes))

# 2. gravação do tour no Chrome (cada trecho dura pelo menos a sua narração)
subprocess.run(["node", str(aqui / "gravar.cjs"), str(raiz), str(trab)], check=True)
linha = json.loads((trab / "linha-do-tempo.json").read_text())
video = linha["video"]
total = duracao(video)

# 3. junta vídeo e narração
destino = raiz / "apresentacao"
destino.mkdir(exist_ok=True)
saida = destino / "demo-serraria-modelo.mp4"
cmd = ["ffmpeg", "-v", "error", "-y", "-i", video]
filtros, rotulos = [], []
for k, t in enumerate(linha["trechos"]):
    cmd += ["-i", str(trab / "audio" / f"{t['id']}.aiff")]
    ms = int(t["inicio"] * 1000) + 250
    filtros.append(f"[{k + 1}:a]aresample=48000,adelay={ms}|{ms}[a{k}]")
    rotulos.append(f"[a{k}]")
fim = max(0, total - 1.0)
filtros.append("".join(rotulos) + f"amix=inputs={len(rotulos)}:normalize=0,volume=1.6,afade=t=out:st={fim:.2f}:d=1[aout]")
filtros.append(f"[0:v]fps=30,format=yuv420p,fade=t=in:st=0:d=0.6,fade=t=out:st={fim:.2f}:d=1[vout]")
cmd += ["-filter_complex", ";".join(filtros), "-map", "[vout]", "-map", "[aout]", "-c:v", "libx264", "-preset", "medium", "-crf", "21",
        "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-t", f"{total:.2f}", str(saida)]
subprocess.run(cmd, check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(saida), "-vf", "scale=1280:720", "-c:v", "libx264", "-preset", "slow", "-crf", "26",
                "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", str(destino / "demo-serraria-modelo-whatsapp.mp4")], check=True)
print("Pronto:", saida)
print("Lembre de rodar `npm run db:reset`: a gravação confirma uma venda de exemplo.")
