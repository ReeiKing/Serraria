"use client"

import { ContactShadows, Environment, Lightformer } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

/**
 * Cena 3D do hero: uma tora deitada sendo cortada por uma serra circular.
 * Todas as texturas são geradas em canvas (sem imagens externas).
 */

// ---------------------------------------------------------------- utilidades

/** Ruído pseudo-aleatório determinístico (mesma cena a cada carregamento). */
function aleatorio(semente: number) {
  let s = semente
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function canvasTextura(
  largura: number,
  altura: number,
  desenhar: (ctx: CanvasRenderingContext2D) => void,
  srgb = true
) {
  const canvas = document.createElement("canvas")
  canvas.width = largura
  canvas.height = altura
  desenhar(canvas.getContext("2d")!)
  const t = new THREE.CanvasTexture(canvas)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

// ---------------------------------------------------------------- texturas

/** Casca de pinus: placas pequenas alongadas no sentido do tronco, com sulcos. */
function texturaCasca() {
  const r = aleatorio(7)
  const t = canvasTextura(1024, 512, (ctx) => {
    ctx.fillStyle = "#3a2516"
    ctx.fillRect(0, 0, 1024, 512)
    // o comprimento do tronco corre no eixo y do canvas
    const tons = ["#4f3320", "#5a3a24", "#462d1b", "#61402a", "#523521", "#6a4a31"]
    for (let i = 0; i < 1400; i++) {
      const x = r() * 1024
      const y = r() * 560 - 40
      const w = 5 + r() * 14
      const h = 24 + r() * 80
      ctx.fillStyle = tons[Math.floor(r() * tons.length)]!
      ctx.beginPath()
      ctx.ellipse(x, y, w / 2, h / 2, (r() - 0.5) * 0.2, 0, Math.PI * 2)
      ctx.fill()
    }
    // sulcos finos entre as placas
    for (let i = 0; i < 220; i++) {
      ctx.strokeStyle = `rgba(20,11,6,${0.35 + r() * 0.35})`
      ctx.lineWidth = 0.8 + r() * 1.8
      ctx.beginPath()
      let x = r() * 1024
      let y = r() * 512
      ctx.moveTo(x, y)
      const comp = 40 + r() * 140
      for (let d = 0; d < comp; d += 12) {
        x += (r() - 0.5) * 5
        y += 12
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    // pontos de luz/poeira para quebrar a uniformidade
    for (let i = 0; i < 3000; i++) {
      const v = r()
      ctx.fillStyle = v > 0.5 ? `rgba(150,110,75,${v * 0.18})` : `rgba(10,5,2,${v * 0.3})`
      ctx.fillRect(r() * 1024, r() * 512, 1.5, 1.5 + r() * 3)
    }
    // liquens bem sutis
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(120,128,80,${0.04 + r() * 0.06})`
      ctx.beginPath()
      ctx.arc(r() * 1024, r() * 512, 4 + r() * 12, 0, Math.PI * 2)
      ctx.fill()
    }
  })
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(2, 1.4)
  return t
}

/** Topo da tora: anéis de crescimento irregulares, medula, rachaduras e casca. */
function texturaAneis() {
  const r = aleatorio(42)
  return canvasTextura(1024, 1024, (ctx) => {
    const c = 512
    const g = ctx.createRadialGradient(c * 0.98, c * 1.02, 10, c, c, 500)
    g.addColorStop(0, "#c98f55")
    g.addColorStop(0.25, "#e7c28c")
    g.addColorStop(0.75, "#e3b77d")
    g.addColorStop(0.9, "#d6a265")
    g.addColorStop(1, "#b9824a")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 1024, 1024)

    // anéis com contorno ondulado (lenho tardio mais escuro)
    const fases = Array.from({ length: 6 }, () => r() * Math.PI * 2)
    for (let raio = 14; raio < 455; raio += 9 + r() * 9) {
      ctx.beginPath()
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.05) {
        const onda =
          Math.sin(a * 3 + fases[0]!) * raio * 0.018 + Math.sin(a * 7 + fases[1]!) * raio * 0.008
        const x = c + 6 + Math.cos(a) * (raio + onda)
        const y = c - 4 + Math.sin(a) * (raio + onda) * 0.97
        if (a === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = `rgba(122,72,32,${0.25 + r() * 0.4})`
      ctx.lineWidth = 1.5 + r() * 3.5
      ctx.stroke()
    }

    // marcas finas de serra (riscos paralelos)
    ctx.strokeStyle = "rgba(90,50,20,0.06)"
    ctx.lineWidth = 2
    for (let y = 0; y < 1024; y += 7) {
      ctx.beginPath()
      ctx.moveTo(0, y + Math.sin(y) * 2)
      ctx.lineTo(1024, y + 14)
      ctx.stroke()
    }

    // rachaduras radiais de secagem
    ctx.strokeStyle = "rgba(55,28,10,0.75)"
    for (const ang of [0.4, 2.3, 4.1]) {
      ctx.lineWidth = 3
      ctx.beginPath()
      let x = c
      let y = c
      ctx.moveTo(x, y)
      const comp = 180 + r() * 200
      for (let d = 0; d < comp; d += 20) {
        x += Math.cos(ang + (r() - 0.5) * 0.3) * 20
        y += Math.sin(ang + (r() - 0.5) * 0.3) * 20
        ctx.lineTo(x, y)
        ctx.lineWidth = Math.max(0.5, 3 - d / 80)
      }
      ctx.stroke()
    }

    // medula
    ctx.fillStyle = "#6b3e1c"
    ctx.beginPath()
    ctx.arc(c + 6, c - 4, 7, 0, Math.PI * 2)
    ctx.fill()

    // casca na borda
    ctx.lineWidth = 46
    ctx.strokeStyle = "#3a2314"
    ctx.beginPath()
    ctx.arc(c, c, 492, 0, Math.PI * 2)
    ctx.stroke()
    ctx.lineWidth = 8
    ctx.strokeStyle = "#7a4e2b" // câmbio, entre casca e lenho
    ctx.beginPath()
    ctx.arc(c, c, 466, 0, Math.PI * 2)
    ctx.stroke()
    for (let i = 0; i < 240; i++) {
      const a = r() * Math.PI * 2
      const rr = 470 + r() * 40
      ctx.fillStyle = r() > 0.5 ? "#24150b" : "#4d301b"
      ctx.beginPath()
      ctx.arc(c + Math.cos(a) * rr, c + Math.sin(a) * rr, 3 + r() * 8, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

/** Aço escovado: riscos concêntricos para o brilho circular da lâmina. */
function texturaAcoEscovado() {
  const r = aleatorio(3)
  const t = canvasTextura(
    512,
    512,
    (ctx) => {
      ctx.fillStyle = "#808080"
      ctx.fillRect(0, 0, 512, 512)
      for (let raio = 2; raio < 360; raio += 1.2) {
        const v = 100 + Math.floor(r() * 80)
        ctx.strokeStyle = `rgb(${v},${v},${v})`
        ctx.lineWidth = 0.8
        ctx.beginPath()
        ctx.arc(256, 256, raio, 0, Math.PI * 2)
        ctx.stroke()
      }
    },
    false
  )
  return t
}

// ---------------------------------------------------------------- geometria da lâmina

const RAIO_LAMINA = 0.86
const DENTES = 40

function geometriaLamina() {
  const forma = new THREE.Shape()
  const passo = (Math.PI * 2) / DENTES
  const polar = (raio: number, a: number) =>
    new THREE.Vector2(Math.cos(a) * raio, Math.sin(a) * raio)
  for (let i = 0; i < DENTES; i++) {
    const a = i * passo
    const base = polar(RAIO_LAMINA * 0.9, a)
    const ponta = polar(RAIO_LAMINA, a + passo * 0.12)
    const costas = polar(RAIO_LAMINA * 0.955, a + passo * 0.8)
    if (i === 0) forma.moveTo(base.x, base.y)
    else forma.lineTo(base.x, base.y)
    forma.lineTo(ponta.x, ponta.y)
    forma.lineTo(costas.x, costas.y)
  }
  forma.closePath()

  // furo central
  const furo = new THREE.Path()
  furo.absarc(0, 0, 0.06, 0, Math.PI * 2, true)
  forma.holes.push(furo)
  // furos de dilatação (terminam em círculo, como nas lâminas reais)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.3
    const h = new THREE.Path()
    h.absarc(
      Math.cos(a) * RAIO_LAMINA * 0.74,
      Math.sin(a) * RAIO_LAMINA * 0.74,
      0.022,
      0,
      Math.PI * 2,
      true
    )
    forma.holes.push(h)
  }
  // recortes decorativos de redução de ruído
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const h = new THREE.Path()
    h.absarc(
      Math.cos(a) * RAIO_LAMINA * 0.42,
      Math.sin(a) * RAIO_LAMINA * 0.42,
      0.045,
      0,
      Math.PI * 2,
      true
    )
    forma.holes.push(h)
  }

  const geo = new THREE.ExtrudeGeometry(forma, {
    depth: 0.018,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 1,
    curveSegments: 40,
  })
  geo.translate(0, 0, -0.009)
  return geo
}

// ---------------------------------------------------------------- objetos

const TORA = { raio: 0.62, comprimento: 3.2 }

function Tora() {
  const [casca, aneis] = useMemo(() => [texturaCasca(), texturaAneis()], [])
  const materiais = useMemo(
    () => [
      new THREE.MeshStandardMaterial({
        map: casca,
        bumpMap: casca,
        bumpScale: 2.5,
        roughness: 0.92,
        color: "#f2e6dc",
      }),
      new THREE.MeshStandardMaterial({
        map: aneis,
        color: "#e9d3b8",
        bumpMap: aneis,
        bumpScale: 0.6,
        roughness: 0.75,
      }),
      new THREE.MeshStandardMaterial({ map: aneis, color: "#e9d3b8", roughness: 0.75 }),
    ],
    [casca, aneis]
  )
  return (
    <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={materiais}>
      <cylinderGeometry args={[TORA.raio * 0.96, TORA.raio, TORA.comprimento, 96, 1]} />
    </mesh>
  )
}

/** Posição do centro da lâmina no eixo x (onde ela corta a tora). */
const X_CORTE = -0.35

function Serra({ movimento }: { movimento: boolean }) {
  const giro = useRef<THREE.Group>(null)
  const conjunto = useRef<THREE.Group>(null)
  const geo = useMemo(() => geometriaLamina(), [])
  const escovado = useMemo(() => {
    const t = texturaAcoEscovado()
    // UV do Extrude = coordenadas da forma (−R..R): ajusta para 0..1
    t.repeat.set(1 / (RAIO_LAMINA * 2), 1 / (RAIO_LAMINA * 2))
    t.offset.set(0.5, 0.5)
    return t
  }, [])

  // pastilhas de metal duro nas pontas dos dentes
  const pastilhas = useMemo(() => {
    const passo = (Math.PI * 2) / DENTES
    return Array.from({ length: DENTES }, (_, i) => {
      const a = i * passo + passo * 0.12
      return {
        pos: [Math.cos(a) * (RAIO_LAMINA - 0.012), Math.sin(a) * (RAIO_LAMINA - 0.012), 0] as const,
        rot: a + Math.PI / 2,
      }
    })
  }, [])

  useFrame((state, delta) => {
    if (!giro.current || !conjunto.current) return
    if (movimento) giro.current.rotation.z -= delta * 14
    // desce até cortar ~60% da tora e sobe, em ciclos de 7 s
    const t = state.clock.elapsedTime
    const ciclo = movimento ? (1 - Math.cos((t / 7) * Math.PI * 2)) / 2 : 0.55
    const profundidade = 0.08 + ciclo * 0.7
    conjunto.current.position.y = TORA.raio + RAIO_LAMINA - profundidade
    conjunto.current.userData.profundidade = profundidade
  })

  return (
    <group ref={conjunto} position={[X_CORTE, 1, 0]} name="serra">
      <group rotation={[0, Math.PI / 2, 0]}>
        <group ref={giro}>
          <mesh geometry={geo} castShadow>
            <meshPhysicalMaterial
              color="#eceef0"
              metalness={0.82}
              roughness={0.3}
              roughnessMap={escovado}
              clearcoat={0.4}
              clearcoatRoughness={0.25}
            />
          </mesh>
          {pastilhas.map((p, i) => (
            <mesh key={i} position={p.pos} rotation={[0, 0, p.rot]}>
              <boxGeometry args={[0.03, 0.018, 0.03]} />
              <meshStandardMaterial color="#8a8172" metalness={0.9} roughness={0.35} />
            </mesh>
          ))}
          {/* flange e porca do eixo */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.05, 48]} />
            <meshStandardMaterial color="#3f3f46" metalness={0.9} roughness={0.35} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.09, 6]} />
            <meshStandardMaterial color="#a1a1aa" metalness={1} roughness={0.25} />
          </mesh>
          {/* faixa laranja de marca na lâmina */}
          <mesh position={[0, 0, 0.0125]}>
            <ringGeometry args={[0.2, 0.235, 64]} />
            <meshStandardMaterial color="#ea580c" metalness={0.3} roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/** Serragem saindo do corte enquanto a lâmina está dentro da madeira. */
function Serragem({ movimento }: { movimento: boolean }) {
  const N = 900
  const pontos = useRef<THREE.Points>(null)
  const dados = useMemo(() => {
    const pos = new Float32Array(N * 3)
    const vel = new Float32Array(N * 3)
    const vida = new Float32Array(N)
    const cores = new Float32Array(N * 3)
    const r = aleatorio(11)
    const tons = [
      new THREE.Color("#f3d39b"),
      new THREE.Color("#e2b878"),
      new THREE.Color("#c99256"),
    ]
    for (let i = 0; i < N; i++) {
      vida[i] = -r() * 2 // nasce escalonado
      const c = tons[i % tons.length]!
      cores.set([c.r, c.g, c.b], i * 3)
      pos.set([0, -10, 0], i * 3)
    }
    return { pos, vel, vida, cores, r }
  }, [])

  useFrame((state, delta) => {
    const p = pontos.current
    if (!p || !movimento) return
    const serra = state.scene.getObjectByName("serra")
    const prof = (serra?.userData.profundidade as number | undefined) ?? 0
    const cortando = prof > 0.12
    const centroY = serra?.position.y ?? 1
    // ponto onde os dentes saem da madeira (lado da câmera)
    const ySaida = TORA.raio * 0.92
    const zSaida = Math.sqrt(Math.max(0, RAIO_LAMINA ** 2 - (centroY - ySaida) ** 2))
    const dt = Math.min(delta, 0.05)
    const { pos, vel, vida, r } = dados

    for (let i = 0; i < N; i++) {
      vida[i]! -= dt
      if (vida[i]! <= 0) {
        // fora do corte, a partícula some; no corte, renasce aos poucos (fluxo contínuo)
        if (!cortando || r() > 0.45) {
          if (vida[i]! < -1.5) pos[i * 3 + 1] = -10
          else if (!cortando) {
            vel[i * 3 + 1]! -= 4.2 * dt
            pos[i * 3 + 1]! += vel[i * 3 + 1]! * dt
          }
          continue
        }
        vida[i] = 0.6 + r() * 0.9
        pos.set([X_CORTE + (r() - 0.5) * 0.04, ySaida, zSaida], i * 3)
        const v = 1.2 + r() * 2.2
        vel.set([(r() - 0.5) * 0.9, 0.6 + r() * 1.6, v], i * 3)
      }
      vel[i * 3 + 1]! -= 4.2 * dt // gravidade
      vel[i * 3]! *= 0.985
      vel[i * 3 + 2]! *= 0.985
      pos[i * 3]! += vel[i * 3]! * dt
      pos[i * 3 + 1]! += vel[i * 3 + 1]! * dt
      pos[i * 3 + 2]! += vel[i * 3 + 2]! * dt
    }
    p.geometry.attributes.position!.needsUpdate = true
  })

  return (
    <points ref={pontos} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[dados.pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[dados.cores, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.034}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.95}
        depthWrite={false}
      />
    </points>
  )
}

/** Brilho quente no ponto de corte (atrito), pulsando com a profundidade. */
function BrilhoCorte({ movimento }: { movimento: boolean }) {
  const luz = useRef<THREE.PointLight>(null)
  useFrame((state) => {
    const serra = state.scene.getObjectByName("serra")
    const prof = (serra?.userData.profundidade as number | undefined) ?? 0
    if (luz.current)
      luz.current.intensity = movimento
        ? Math.max(0, prof - 0.1) * 3 * (0.85 + Math.random() * 0.3)
        : 0
  })
  return (
    <pointLight
      ref={luz}
      position={[X_CORTE, TORA.raio + 0.1, 0.5]}
      color="#ffb347"
      distance={2}
      decay={2}
    />
  )
}

/** Conjunto inteiro, com entrada animada e leve inclinação seguindo o mouse. */
function Conjunto({ movimento }: { movimento: boolean }) {
  const grupo = useRef<THREE.Group>(null)
  useFrame((state, delta) => {
    const g = grupo.current
    if (!g) return
    // suavização baseada no tempo (mesmo resultado em 30 ou 120 fps)
    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 4)
    const t = state.clock.elapsedTime
    const entrada = Math.min(1, t / 1.4)
    const suave = 1 - Math.pow(1 - entrada, 3)
    g.scale.setScalar(0.75 + 0.25 * suave)
    const alvoY = -0.85 + (movimento ? state.pointer.x * 0.15 : 0) + (1 - suave) * -0.6
    const alvoX = movimento ? -state.pointer.y * 0.06 : 0
    g.rotation.y += (alvoY - g.rotation.y) * k
    g.rotation.x += (alvoX - g.rotation.x) * k
  })
  return (
    <group ref={grupo} position={[0, -0.25, 0]}>
      <Tora />
      <Serra movimento={movimento} />
      <Serragem movimento={movimento} />
      <BrilhoCorte movimento={movimento} />
    </group>
  )
}

export default function CenaSerraria({
  movimento = true,
  ativo = true,
}: {
  movimento?: boolean
  ativo?: boolean
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      frameloop={ativo ? "always" : "never"}
      camera={{ position: [1.2, 1.7, 5.4], fov: 36 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      onCreated={({ camera }) => camera.lookAt(0, 0.35, 0)}
      fallback={null}
    >
      <ambientLight intensity={0.35} color="#ffe2c2" />
      <directionalLight
        position={[4, 6, 3]}
        intensity={2.6}
        color="#ffd7a8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-4, 2, -3]} intensity={1.1} color="#9ab8ff" />
      <directionalLight position={[2, 1.5, 6]} intensity={0.9} color="#fff4e6" />
      {/* reflexos do metal gerados localmente (sem baixar HDR) */}
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={3}
          color="#fff1dc"
          position={[0, 4, 2]}
          scale={[8, 2, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          color="#ffb070"
          position={[5, 1, 0]}
          rotation-y={-Math.PI / 2}
          scale={[4, 3, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.8}
          color="#88aaff"
          position={[-5, 1, -1]}
          rotation-y={Math.PI / 2}
          scale={[4, 3, 1]}
        />
        <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, 2, 5]} scale={1.5} />
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#f5efe6"
          position={[0, -1.5, 4]}
          scale={[8, 2, 1]}
        />
        {/* placas laterais: dão o brilho nas duas faces da lâmina */}
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#ffffff"
          position={[6, 2, 2]}
          rotation-y={-Math.PI / 2}
          scale={[6, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.4}
          color="#ffe6cc"
          position={[-6, 2, 3]}
          rotation-y={Math.PI / 2}
          scale={[6, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#ffd9b0"
          position={[3, -2, 2]}
          rotation-x={Math.PI / 4}
          scale={[6, 2, 1]}
        />
      </Environment>
      <Conjunto movimento={movimento} />
      <ContactShadows
        position={[0, -0.88, 0]}
        opacity={0.5}
        scale={6}
        blur={2.8}
        far={1.6}
        color="#120802"
      />
    </Canvas>
  )
}
