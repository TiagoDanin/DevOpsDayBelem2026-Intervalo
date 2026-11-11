// Passa os slides de um intervalo em loop. Fundo (ondas, gaivotas) fica montado; só o conteúdo troca, com fade.
// Clique na tela passa para o próximo slide (slide com tempo infinito fica parado até o clique).
// Teclas: → próximo, ← anterior, espaço pausa, Esc volta para a escolha. Os controles aparecem quando o mouse mexe;
// neles dá para escolher a página (slide), a velocidade (vale para o tempo de cada slide e para a rolagem do backdrop)
// e ligar/desligar o aleatório: ligado, os grupos `mistura` (diamantes, palestras) trocam de ordem a cada volta do loop;
// desligado, ficam na ordem da lista (palestras na ordem da programação).
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRightLeft, Gauge, Layers, Maximize, Pause, Play, Shuffle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { nomeSlide, type Intervalo, type SlideDef } from '@/data'
import { Cena, Logo, Palco } from '@/components/base'
import { SlideCotas, SlideDiamante, SlideEvento, SlideTodos } from '@/components/slides/patrocinio'
import { SlideExplica } from '@/components/slides/explica'
import { GAIVOTAS_BACKDROP, SlideRolagem } from '@/components/slides/rolagem'
import { SlidePalestra } from '@/components/slides/palestra'
import { SlideSorteio } from '@/components/slides/sorteio'
import { SlidePalco } from '@/components/slides/fishbowl-palco'

// slides com PNG de patrocinador (que têm fundo branco) usam a tela inteira branca
const COM_LOGOS: SlideDef['tipo'][] = ['rolagem', 'diamante', 'cotas', 'todos', 'sorteio', 'palco']
// logo do evento fixo no topo: fica parado enquanto esses slides trocam
const COM_TOPO: SlideDef['tipo'][] = ['diamante', 'cotas', 'todos', 'palestra']
const VELOCIDADES = ['0.2', '0.4', '0.6', '0.8', '1', '1.5', '2', '3']
const lerVel = () => { try { return localStorage.getItem('velocidade') ?? '1' } catch { return '1' } }
// aleatório é por intervalo ('aleatorio-<id>'), igual ao switch do card na tela inicial
const lerAleatorio = (id: string) => { try { return localStorage.getItem(`aleatorio-${id}`) !== 'nao' } catch { return true } }

/** embaralha cada trecho seguido de slides com o mesmo `mistura` (Fisher-Yates) e renumera os pontinhos dos diamantes */
function ordena(slides: SlideDef[], aleatorio: boolean): SlideDef[] {
  const out = [...slides]
  for (let a = 0; a < out.length;) {
    let b = a
    while (b < out.length && out[a].mistura && out[b].mistura === out[a].mistura) b++
    if (b > a + 1 && aleatorio) {
      for (let k = b - 1; k > a; k--) { const j = a + Math.floor(Math.random() * (k - a + 1)); [out[k], out[j]] = [out[j], out[k]] }
    }
    a = Math.max(b, a + 1)
  }
  let n = 0
  return out.map((d) => (d.tipo === 'diamante' ? { ...d, n: ++n } : d))
}

function Slide({ d, vel, url, comunidades }: { d: SlideDef; vel: number; url: string; comunidades: boolean }) {
  switch (d.tipo) {
    case 'diamante': return <SlideDiamante logo={d.logo} n={d.n} />
    case 'cotas': return <SlideCotas grupos={d.grupos} />
    case 'evento': return <SlideEvento linha={d.linha} velocidade={vel} />
    case 'todos': return <SlideTodos semTitulo={d.semTitulo} />
    case 'palco': return <SlidePalco formato={d.formato} velocidade={vel} />
    case 'explica': return <SlideExplica e={d.e} />
    case 'rolagem': return <SlideRolagem velocidade={vel} comunidades={comunidades} />
    case 'palestra': return <SlidePalestra p={d.p} />
    case 'sorteio': return <SlideSorteio url={url} velocidade={vel} />
  }
}

export function telaCheia() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {})
}

export default function Player({ intervalo, sair, url = '' }: { intervalo: Intervalo; sair: () => void; url?: string }) {
  const [i, setI] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [controles, setControles] = useState(true)
  const [vel, setVel] = useState(lerVel)
  const [menu, setMenu] = useState(false)       // seletor aberto: controles não somem
  const [volta, setVolta] = useState(0)          // muda a cada volta do loop para remontar o slide (e repetir as animações)
  const [aleatorio, setAleatorio] = useState(() => lerAleatorio(intervalo.id))
  // nova ordem a cada volta do loop (volta muda quando passa do último para o primeiro)
  // comunidades: preferência por intervalo (padrão vem do intervalo), ligada/desligada no card da tela inicial
  const comunidades = useMemo(() => { try { const v = localStorage.getItem(`comunidades-${intervalo.id}`); return v ? v === 'sim' : !!intervalo.comunidades } catch { return !!intervalo.comunidades } }, [intervalo])
  // patrocínio dinâmico: o slide de cotas vira as logos rolando do backdrop
  const dinamico = useMemo(() => { try { return (localStorage.getItem(`patrocinio-${intervalo.id}`) ?? intervalo.patrocinio) === 'dinamico' } catch { return intervalo.patrocinio === 'dinamico' } }, [intervalo])
  const slides = useMemo(() => ordena(intervalo.slides.filter((d) => comunidades || !d.comunidade)
    .map((d): SlideDef => (dinamico && d.trocavel ? { tipo: 'rolagem', s: d.s } : d)), aleatorio), [intervalo, aleatorio, volta, comunidades, dinamico])
  const temMistura = intervalo.slides.some((d) => d.mistura)
  const n = slides.length
  const atual = slides[i]
  const barra = useRef<HTMLDivElement>(null)

  const vai = useCallback((passo: number) => {
    // passando do último: volta para inicioLoop (os slides antes dele passam só uma vez)
    setI((v) => { if (passo > 0 && v + passo >= n) { setVolta((x) => x + 1); return Math.min(intervalo.inicioLoop ?? 0, n - 1) } return (v + passo + n) % n })
  }, [n, intervalo.inicioLoop])

  // avanço automático com barra de progresso (anima a largura direto no DOM para não re-renderizar a cada quadro)
  useEffect(() => {
    if (pausado || !Number.isFinite(atual.s)) { if (barra.current) barra.current.style.width = '0%'; return }
    const ini = performance.now(), dur = (atual.s * 1000) / Number(vel)
    let raf = 0
    const tick = (t: number) => {
      const p = (t - ini) / dur
      if (barra.current) barra.current.style.width = `${Math.min(100, p * 100)}%`
      if (p >= 1) vai(1); else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [i, volta, pausado, atual.s, vai, vel])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') vai(1)
      else if (e.key === 'ArrowLeft') vai(-1)
      else if (e.key === ' ') { e.preventDefault(); setPausado((p) => !p) }
      else if (e.key === 'Escape' && !document.fullscreenElement) sair()
      else if (e.key.toLowerCase() === 'f') telaCheia()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [vai, sair])

  useEffect(() => {
    if (menu) { setControles(true); return }
    let t = setTimeout(() => setControles(false), 2500)
    const m = () => { setControles(true); clearTimeout(t); t = setTimeout(() => setControles(false), 2500) }
    window.addEventListener('mousemove', m)
    return () => { clearTimeout(t); window.removeEventListener('mousemove', m) }
  }, [menu])

  const mudaVel = (v: string | null) => { if (!v) return; setVel(v); try { localStorage.setItem('velocidade', v) } catch { /* sem storage: vale só nesta aba */ } }
  const trocaAleatorio = () => setAleatorio((a) => { try { localStorage.setItem(`aleatorio-${intervalo.id}`, a ? 'nao' : 'sim') } catch { /* só nesta aba */ } return !a })
  const paginas = slides.map((d, k) => ({ value: String(k), label: `${k + 1}. ${nomeSlide(d)}` }))

  return (
    <div style={{ cursor: controles ? 'pointer' : 'none' }} onClick={() => n > 1 && vai(1)}>
      <Palco>
        <Cena gaivotas={atual.tipo === 'explica' || atual.tipo === 'sorteio' || atual.tipo === 'palco' ? [] : atual.tipo === 'rolagem' ? GAIVOTAS_BACKDROP : undefined} branco={COM_LOGOS.includes(atual.tipo) || (atual.tipo === 'evento' && !!atual.linha)}>
          <AnimatePresence>
            <motion.div key={`${volta}-${aleatorio}-${i}`} className="absolute inset-0"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              <Slide d={atual} vel={Number(vel)} url={url} comunidades={comunidades} />
            </motion.div>
          </AnimatePresence>
          <AnimatePresence>
            {COM_TOPO.includes(atual.tipo) && (
              <motion.div key="topo" className="absolute left-1/2 -translate-x-1/2" style={{ top: 34 }}
                initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.6 }}>
                <Logo nome="evento" area={17000} />
              </motion.div>
            )}
          </AnimatePresence>
        </Cena>
        <div ref={barra} className="absolute bottom-0 left-0 h-2" style={{ background: 'linear-gradient(90deg, #01A8F5, #0A5CFF)' }} />
      </Palco>
      <AnimatePresence>
        {controles && (
          <motion.div className="fixed right-4 top-4 flex gap-2" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Button variant="secondary" onClick={sair}><ArrowLeft /> Intervalos</Button>
            {n > 1 && (
              <Select items={paginas} value={String(i)} onValueChange={(v) => v !== null && setI(Number(v))} onOpenChange={setMenu}>
                <SelectTrigger className="h-8 min-w-60 bg-secondary"><Layers /><SelectValue /></SelectTrigger>
                <SelectContent>{paginas.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            )}
            <Select items={VELOCIDADES.map((v) => ({ value: v, label: `${v.replace('.', ',')}x` }))} value={vel} onValueChange={mudaVel} onOpenChange={setMenu}>
              <SelectTrigger className="h-8 bg-secondary"><Gauge /><SelectValue /></SelectTrigger>
              <SelectContent>{VELOCIDADES.map((v) => <SelectItem key={v} value={v}>{v.replace('.', ',')}x</SelectItem>)}</SelectContent>
            </Select>
            {temMistura && <Button variant="secondary" onClick={trocaAleatorio}>{aleatorio ? <Shuffle /> : <ArrowRightLeft />}{aleatorio ? 'Aleatório' : 'Em ordem'}</Button>}
            {n > 1 && <Button variant="secondary" onClick={() => setPausado((p) => !p)}>{pausado ? <Play /> : <Pause />}{pausado ? 'Continuar' : 'Pausar'}</Button>}
            <Button variant="secondary" onClick={telaCheia}><Maximize /> Tela cheia</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
