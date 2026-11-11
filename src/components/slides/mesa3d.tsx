// Mesa redonda em 3D (three.js), no mesmo palco do fishbowl: mesa com quatro convidados e a mediação no meio, plateia em
// fileiras. Em um ciclo: todos sentados; o balão de fala passa pelos convidados; volta para a mediação; no fim alguém da
// plateia levanta a mão e o balão vai para essa pessoa (perguntas do público). A câmera balança devagar.
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { COR } from '../base'
import { cadeira, CORES, PALCO, pessoa, senta, type Lugar } from './fishbowl3d'

const W = 880, H = 780
const CICLO = 12   // segundos: parado (0-2), convidados falam (2-6,5), mediação (6,5-9), público pergunta (9-12)
/** fase do ciclo, para legendar: 0 todos à mesa, 1 convidados falam, 2 mediação, 3 público pergunta */
export const faseMesa = (t: number) => (t < 2 ? 0 : t < 6.5 ? 1 : t < 9 ? 2 : 3)

// 5 cadeiras atrás da mesa, de frente para a plateia; a do meio é a mediação
const NA_MESA: Lugar[] = [-2.2, -1.1, 0, 1.1, 2.2].map((x) => ({ x, y: PALCO.alto, z: PALCO.z - 0.35 + Math.abs(x) * 0.18, frente: 1 }))
const MEDIACAO = 2
const CONVIDADOS = [0, 1, 3, 4]
const NA_PLATEIA: Lugar[] = [0.4, 1.7, 3.0].flatMap((z, f) =>
  Array.from({ length: 7 }, (_, i) => ({ x: (i - 3) * 1.05 + (f % 2) * 0.2, y: 0, z, frente: -1 as const })))
const PERGUNTA = 10   // lugar da plateia que levanta a mão

export function Mesa3D({ largura = W, altura = H, zoom = 1, lento = 1, atraso = 0, aoFase }:
  { largura?: number; altura?: number; zoom?: number; lento?: number; atraso?: number; aoFase?: (f: number) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const balao = useRef<HTMLDivElement>(null)
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

    const piso = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.18 }))
    piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; cena.add(piso)
    const palco = new THREE.Mesh(new THREE.BoxGeometry(PALCO.larg, PALCO.alto, PALCO.fundo), new THREE.MeshStandardMaterial({ color: '#BFDDF8' }))
    palco.position.set(0, PALCO.alto / 2, PALCO.z); palco.receiveShadow = true; palco.castShadow = true; cena.add(palco)
    const borda = new THREE.Mesh(new THREE.BoxGeometry(PALCO.larg, 0.06, 0.08), new THREE.MeshStandardMaterial({ color: COR.royal }))
    borda.position.set(0, PALCO.alto + 0.01, PALCO.z + PALCO.fundo / 2); cena.add(borda)

    // mesa: tampo oval na frente das cadeiras
    const matMesa = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.4 })
    const tampo = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.08, 48), matMesa)
    tampo.scale.set(2.7, 1, 0.55); tampo.position.set(0, PALCO.alto + 0.72, PALCO.z + 0.35); tampo.castShadow = true; cena.add(tampo)
    const pe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 0.7, 16), new THREE.MeshStandardMaterial({ color: '#DCEBFB' }))
    pe.position.set(0, PALCO.alto + 0.35, PALCO.z + 0.35); cena.add(pe)

    NA_MESA.forEach((l) => cena.add(cadeira(l, '#FFFFFF')))
    NA_PLATEIA.forEach((l) => cena.add(cadeira(l, '#DCEBFB')))
    const naMesa = NA_MESA.map((l, i) => { const p = pessoa(i === MEDIACAO ? COR.eletrico : CORES[i % CORES.length]); senta(p, l); cena.add(p); return p })
    const naPlateia = NA_PLATEIA.map((l, j) => { const p = pessoa(CORES[(j + 3) % CORES.length]); senta(p, l); cena.add(p); return p })

    // braço levantado de quem pergunta
    const braco = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.5, 4, 8), new THREE.MeshStandardMaterial({ color: CORES[(PERGUNTA + 3) % CORES.length] }))
    braco.position.set(0.22, 1.25, 0); braco.rotation.z = -0.25; braco.visible = false
    naPlateia[PERGUNTA].add(braco)

    let raf = 0, fase = -1
    const t0 = performance.now()
    const projeta = new THREE.Vector3()
    const naTela = (div: HTMLDivElement | null, x: number, y: number, z: number) => {
      if (!div) return
      projeta.set(x, y, z).project(camera)
      div.style.transform = `translate(${(projeta.x * 0.5 + 0.5) * largura}px, ${(-projeta.y * 0.5 + 0.5) * altura}px) translate(-50%, -100%)`
    }
    const tick = (agora: number) => {
      const seg = (agora - t0) / 1000
      const ang = Math.PI / 2 + Math.sin(seg * 0.15) * 0.45
      camera.position.set(Math.cos(ang) * 12 / zoom, 9 / zoom, Math.sin(ang) * 12 / zoom)
      camera.lookAt(0, 0, -0.6)

      const t = (Math.max(0, seg - atraso) / lento) % CICLO
      const f = faseMesa(t)
      if (f !== fase) { fase = f; avisa.current?.(f) }

      // quem está com a palavra
      let quem: THREE.Group | null = null
      if (f === 1) quem = naMesa[CONVIDADOS[Math.min(3, Math.floor((t - 2) / 1.125))]]
      else if (f === 2) quem = naMesa[MEDIACAO]
      else if (f === 3) quem = naPlateia[PERGUNTA]
      braco.visible = f === 3
      naPlateia[PERGUNTA].position.y = f === 3 ? 0.32 : 0.2   // levanta um pouco da cadeira
      naMesa.forEach((p) => { p.position.y = PALCO.alto + 0.2 + (p === quem ? Math.abs(Math.sin(seg * 6)) * 0.05 : 0) })

      renderer.render(cena, camera)
      if (balao.current) {
        balao.current.style.opacity = quem ? '1' : '0'
        if (quem) naTela(balao.current, quem.position.x, quem.position.y + 1.55, quem.position.z)
      }
      const m = naMesa[MEDIACAO].position
      naTela(rotulo.current, m.x, PALCO.alto + 0.6, m.z + 1.15)   // na borda da mesa, na frente da mediação
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
      <div ref={balao} className="pointer-events-none absolute left-0 top-0 flex items-center gap-[6px] rounded-full bg-white"
        style={{ padding: '10px 16px', border: `4px solid ${COR.royal}`, transition: 'opacity .25s', zIndex: 1 }}>
        {[0, 1, 2].map((i) => <span key={i} className="block rounded-full" style={{ width: 10, height: 10, background: COR.royal }} />)}
      </div>
      <div ref={rotulo} className="pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-full font-extrabold text-white"
        style={{ fontSize: 18, letterSpacing: '.12em', background: COR.royal, padding: '5px 14px', zIndex: 1 }}>MEDIAÇÃO</div>
    </div>
  )
}
