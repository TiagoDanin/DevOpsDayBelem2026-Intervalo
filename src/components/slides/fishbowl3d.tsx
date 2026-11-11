// Fishbowl em 3D (three.js): palco com quatro cadeiras (três pessoas e uma cadeira livre) e a plateia em fileiras de frente
// para o palco. Em loop: alguém da plateia sobe e senta na cadeira livre, e uma pessoa do palco levanta, desce e volta para o
// lugar que ficou vago na plateia; a cadeira que ela deixou vira a nova cadeira livre. A câmera balança devagar.
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { COR } from '../base'

const W = 880, H = 780   // mais largo que a caixa do slide (720): a cena inteira cabe sem borda reta cortando o piso
export const PALCO = { z: -2.6, alto: 0.4, larg: 6.4, fundo: 2.4 }
export const CORES = [COR.royal, COR.ceu, COR.noite, '#37B1FE', COR.eletrico, '#2A5BA8']
const CICLO = 9   // segundos: entra (0,5-3,5), pausa, sai (4,5-7,5), pausa

export type Lugar = { x: number; y: number; z: number; frente: 1 | -1 }   // frente: +1 olha para a plateia, -1 olha para o palco

// palco: 4 cadeiras num arco raso virado para a plateia
const NO_PALCO: Lugar[] = [-2.1, -0.7, 0.7, 2.1].map((x) => ({ x, y: PALCO.alto, z: PALCO.z + Math.abs(x) * 0.12, frente: 1 }))
// plateia: 3 fileiras de 7, de frente para o palco
const NA_PLATEIA: Lugar[] = [0.4, 1.7, 3.0].flatMap((z, f) =>
  Array.from({ length: 7 }, (_, i) => ({ x: (i - 3) * 1.05 + (f % 2) * 0.2, y: 0, z, frente: -1 as const })))

export function cadeira(l: Lugar, cor: string) {
  const g = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.6 })
  const assento = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.58), mat); assento.position.y = 0.45
  const encosto = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.08), mat); encosto.position.set(0, 0.76, 0.28)
  for (const m of [assento, encosto]) { m.castShadow = true; g.add(m) }
  for (const [x, z] of [[-0.26, -0.24], [0.26, -0.24], [-0.26, 0.24], [0.26, 0.24]]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.06), mat); p.position.set(x, 0.225, z); g.add(p)
  }
  g.position.set(l.x, l.y, l.z)
  g.rotation.y = l.frente === 1 ? Math.PI : 0   // encosto atrás de quem senta
  return g
}

export function pessoa(cor: string) {
  const g = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.5 })
  const corpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.42, 6, 16), mat); corpo.position.y = 0.55; corpo.castShadow = true
  const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), mat); cabeca.position.y = 1.08; cabeca.castShadow = true
  g.add(corpo, cabeca)
  return g
}

export function senta(p: THREE.Group, l: Lugar) { p.position.set(l.x, l.y + 0.2, l.z); p.rotation.y = l.frente === 1 ? 0 : Math.PI }

const suave = (t: number) => t * t * (3 - 2 * t)

/** caminho entre um lugar da plateia e uma cadeira do palco: corredor na frente da 1ª fileira, degrau, cadeira */
function rota(plateia: Lugar, palco: Lugar): THREE.Vector3[] {
  const frenteFileira = -0.5, beira = PALCO.z + PALCO.fundo / 2 + 0.2
  return [
    new THREE.Vector3(plateia.x, 0, plateia.z),
    new THREE.Vector3(plateia.x, 0, frenteFileira),
    new THREE.Vector3(palco.x, 0, beira),
    new THREE.Vector3(palco.x, PALCO.alto, beira - 0.5),
    new THREE.Vector3(palco.x, PALCO.alto, palco.z),
  ]
}

/** posição ao longo do caminho (t de 0 a 1), andando com passo */
function anda(p: THREE.Group, pts: THREE.Vector3[], t: number) {
  const lens = pts.slice(1).map((q, i) => q.distanceTo(pts[i]))
  let d = suave(t) * lens.reduce((a, b) => a + b, 0), i = 0
  while (i < lens.length - 1 && d > lens[i]) { d -= lens[i]; i++ }
  const pos = pts[i].clone().lerp(pts[i + 1], lens[i] ? d / lens[i] : 1)
  const dx = pos.x - p.position.x, dz = pos.z - p.position.z
  if (Math.hypot(dx, dz) > 1e-4) p.rotation.y = Math.atan2(dx, dz)
  p.position.set(pos.x, pos.y + 0.18 + Math.abs(Math.sin(t * Math.PI * 8)) * 0.06, pos.z)
}

/** fase do ciclo, para quem quiser legendar a cena: 0 parado, 1 alguém sobe, 2 conversa, 3 alguém dá a vez */
export const faseDo = (t: number) => (t < 0.5 ? 0 : t < 3.5 ? 1 : t < 4.5 ? 2 : t < 7.5 ? 3 : 0)

// lento: estica o ciclo (1,4 = 40% mais devagar); atraso: segundos parado antes da primeira troca
export function Fishbowl3D({ largura = W, altura = H, zoom = 1, lento = 1, atraso = 0, aoFase }:
  { largura?: number; altura?: number; zoom?: number; lento?: number; atraso?: number; aoFase?: (f: number) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const rotulo = useRef<HTMLDivElement>(null)
  const avisa = useRef(aoFase); avisa.current = aoFase

  useEffect(() => {
    const el = box.current!
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
    renderer.setSize(largura, altura)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    el.appendChild(renderer.domElement)

    const cena = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, largura / altura, 0.1, 100)
    cena.add(new THREE.HemisphereLight('#ffffff', '#BFDDF8', 1.6))
    const sol = new THREE.DirectionalLight('#ffffff', 1.6)
    sol.position.set(4, 10, 6); sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024)
    Object.assign(sol.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 })
    cena.add(sol)

    // piso invisível que só recebe as sombras: sem superfície para a borda do canvas cortar
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.18 }))
    piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; cena.add(piso)
    const palco = new THREE.Mesh(new THREE.BoxGeometry(PALCO.larg, PALCO.alto, PALCO.fundo), new THREE.MeshStandardMaterial({ color: '#BFDDF8' }))
    palco.position.set(0, PALCO.alto / 2, PALCO.z); palco.receiveShadow = true; palco.castShadow = true; cena.add(palco)
    const borda = new THREE.Mesh(new THREE.BoxGeometry(PALCO.larg, 0.06, 0.08), new THREE.MeshStandardMaterial({ color: COR.royal }))
    borda.position.set(0, PALCO.alto + 0.01, PALCO.z + PALCO.fundo / 2); cena.add(borda)

    NO_PALCO.forEach((l) => cena.add(cadeira(l, '#FFFFFF')))
    NA_PLATEIA.forEach((l) => cena.add(cadeira(l, '#DCEBFB')))

    const anel = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.62, 48), new THREE.MeshBasicMaterial({ color: COR.royal, transparent: true }))
    anel.rotation.x = -Math.PI / 2; cena.add(anel)

    // começa com a cadeira 3 livre; quem está em cada lugar (ou null)
    let livre = 3
    const noPalco: (THREE.Group | null)[] = NO_PALCO.map((l, i) => { if (i === livre) return null; const p = pessoa(CORES[i]); senta(p, l); cena.add(p); return p })
    const naPlateia: (THREE.Group | null)[] = NA_PLATEIA.map((l, j) => { const p = pessoa(CORES[(j + 3) % CORES.length]); senta(p, l); cena.add(p); return p })
    let ciclo = -1, entrou = false, saiu = false, fase = -1
    let entra = { p: null as THREE.Group | null, de: 0 }, sai = { p: null as THREE.Group | null, de: 0 }

    let raf = 0
    const t0 = performance.now()
    const projeta = new THREE.Vector3()
    const tick = (agora: number) => {
      const seg = (agora - t0) / 1000
      // câmera do lado da plateia, balançando devagar para os lados
      const ang = Math.PI / 2 + Math.sin(seg * 0.15) * 0.45
      camera.position.set(Math.cos(ang) * 12 / zoom, 9 / zoom, Math.sin(ang) * 12 / zoom)
      camera.lookAt(0, 0, -0.6)

      const st = Math.max(0, seg - atraso) / lento   // tempo da cena (a câmera usa o tempo real)
      const c = Math.floor(st / CICLO), t = st % CICLO
      if (faseDo(t) !== fase) { fase = faseDo(t); avisa.current?.(fase) }
      if (c !== ciclo) {
        ciclo = c; entrou = false; saiu = false
        // entra alguém da plateia (varia a fileira e o lado a cada ciclo); sai uma das pessoas do palco
        const ocupados = naPlateia.map((p, j) => (p ? j : -1)).filter((j) => j >= 0)
        const de = ocupados[(c * 8 + 3) % ocupados.length]
        entra = { p: naPlateia[de], de }
        const noPalcoOcup = noPalco.map((p, i) => (p ? i : -1)).filter((i) => i >= 0)
        sai = { p: null, de: noPalcoOcup[c % noPalcoOcup.length] }
      }
      if (entra.p) {
        if (t >= 0.5 && t < 3.5) anda(entra.p, rota(NA_PLATEIA[entra.de], NO_PALCO[livre]), (t - 0.5) / 3)
        else if (t >= 3.5 && !entrou) { senta(entra.p, NO_PALCO[livre]); noPalco[livre] = entra.p; naPlateia[entra.de] = null; sai.p = noPalco[sai.de]; entrou = true }
      }
      if (sai.p) {
        if (t >= 4.5 && t < 7.5) anda(sai.p, rota(NA_PLATEIA[entra.de], NO_PALCO[sai.de]).reverse(), (t - 4.5) / 3)
        else if (t >= 7.5 && !saiu) { senta(sai.p, NA_PLATEIA[entra.de]); naPlateia[entra.de] = sai.p; noPalco[sai.de] = null; livre = sai.de; saiu = true }
      }
      // a cadeira livre muda quando a pessoa do palco levanta
      const alvo = t >= 4.5 && sai.p ? sai.de : livre
      const l = NO_PALCO[alvo]
      anel.position.set(l.x, PALCO.alto + 0.02, l.z)
      const pulso = 1 + Math.sin(seg * 4) * 0.12
      anel.scale.set(pulso, pulso, 1)
      ;(anel.material as THREE.MeshBasicMaterial).opacity = t >= 0.5 && t < 3.5 ? 0.5 : 1

      renderer.render(cena, camera)
      if (rotulo.current) {
        projeta.set(l.x, PALCO.alto + 1.6, l.z).project(camera)
        rotulo.current.style.transform = `translate(${(projeta.x * 0.5 + 0.5) * largura}px, ${(-projeta.y * 0.5 + 0.5) * altura - 20}px) translateX(-50%)`
        rotulo.current.style.opacity = t >= 0.5 && t < 3.5 ? '0.35' : '1'
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      cena.traverse((o) => { if (o instanceof THREE.Mesh) { o.geometry.dispose(); (o.material as THREE.Material).dispose() } })
      renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [largura, altura, zoom, lento, atraso])

  return (
    <div ref={box} className="relative" style={{ width: largura, height: altura }}>
      <div ref={rotulo} className="pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-full font-extrabold text-white"
        style={{ fontSize: 20, letterSpacing: '.12em', background: COR.royal, padding: '6px 16px', zIndex: 1 }}>CADEIRA LIVRE</div>
    </div>
  )
}
