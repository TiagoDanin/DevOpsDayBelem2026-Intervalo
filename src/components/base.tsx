// Peças do UI kit usadas em todos os slides: palco 1920x1080 escalado, fundo com ondas e gaivotas, logo, rótulo e título.
import { motion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import P from '@/logos'
import type { LogoNome } from '@/data'

export const W = 1920
export const H = 1080
export const asset = (p: string) => import.meta.env.BASE_URL + p
export const COR = { noite: '#043378', royal: '#0A5CFF', eletrico: '#0043DF', ceu: '#01A8F5', texto: '#2A5BA8', gelo: '#BFDDF8' }

/** escala o desenho de 1920x1080 para caber na janela; o palco ocupa a janela inteira (fundo e ondas vão até as bordas reais,
 *  sem faixas sobrando), e o conteúdo fica num quadro 1920x1080 centralizado (ver Cena) */
export function Palco({ children }: { children: ReactNode }) {
  const [t, setT] = useState({ s: 1, w: W, h: H })
  useEffect(() => {
    const f = () => { const s = Math.min(window.innerWidth / W, window.innerHeight / H); setT({ s, w: window.innerWidth / s, h: window.innerHeight / s }) }
    f(); window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])
  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute left-0 top-0 overflow-hidden" style={{ width: t.w, height: t.h, transform: `scale(${t.s})`, transformOrigin: '0 0' }}>
        {children}
      </div>
      {ONDAS.map((o) => <Onda key={o.nome} {...o} camada="frente" />)}
    </div>
  )
}

// os SVGs das ondas vêm recortados na borda da peça original; o balanço (giro de 1,5°) puxaria esse corte reto para dentro da tela,
// então cada onda fica SOBRA px além do canto
const SOBRA = 40
const balanco = (d: number) => ({ animate: { scale: [1, 1.06], rotate: [0, 1.5] }, transition: { duration: d, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const } })
const voo = (d: number) => ({ animate: { x: [0, 14], y: [0, -12], rotate: [-3, 3] }, transition: { duration: d, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const } })

// cada onda tem duas camadas (scripts/ondas_camadas.py): a clara fica atrás do conteúdo e a azul-escura na frente,
// então o que passa no canto (as logos rolando) entra entre as duas. As duas balançam juntas (mesma animação).
const ONDAS = [
  { nome: 'onda-sup-esq', style: { left: -87 - SOBRA, top: -157 - SOBRA, width: 496, transformOrigin: '0 0' }, d: 7 },
  { nome: 'onda-sup-dir', style: { right: -87 - SOBRA, top: -157 - SOBRA, width: 496, transformOrigin: '100% 0' }, d: 8 },
  { nome: 'onda-inf-esq', style: { left: -111 - SOBRA, bottom: -253 - SOBRA, width: 632, transformOrigin: '0 100%' }, d: 9 },
  { nome: 'onda-inf-dir', style: { right: -111 - SOBRA, bottom: -253 - SOBRA, width: 632, transformOrigin: '100% 100%' }, d: 7.5 },
]
function Onda({ nome, style, d, camada }: (typeof ONDAS)[number] & { camada: 'costas' | 'frente' }) {
  return <motion.img src={asset(`kit/${nome}-${camada}.svg`)} className="pointer-events-none absolute" style={style} {...balanco(d)} />
}

/** fundo do kit: céu, ondas nos cantos balançando e gaivotas voando. Fica montado durante o intervalo inteiro. */
type Gaivota = [x: number, y: number, w: number]
const GAIVOTAS: Gaivota[] = [[1560, 150, 70], [1660, 205, 44], [1450, 95, 48]]

export function Cena({ children, gaivotas = GAIVOTAS, branco }: { children?: ReactNode; gaivotas?: Gaivota[]; branco?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden font-sans" style={{
      color: COR.noite,
      background: 'radial-gradient(circle at 15% 10%, rgba(169,209,248,.45), rgba(169,209,248,0) 60%), radial-gradient(circle at 90% 55%, rgba(147,196,246,.3), rgba(147,196,246,0) 55%), linear-gradient(180deg, #FFFFFF 0%, #EEF5FD 55%, #D6E8FB 100%)',
    }}>
      <motion.div className="absolute inset-0 bg-white" initial={false} animate={{ opacity: branco ? 1 : 0 }} transition={{ duration: 0.6 }} />
      {ONDAS.map((o) => <Onda key={o.nome} {...o} camada="costas" />)}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: W, height: H }}>
        {gaivotas.map(([x, y, w], i) => (
          <motion.img key={i} src={asset(i % 2 ? 'kit/gaivota-2.svg' : 'kit/gaivota.svg')} className="absolute" style={{ left: x, top: y, width: w }} {...voo(2.5 + (i % 3) * 0.5)} />
        ))}
        {children}
      </div>
    </div>
  )
}

// sobe quando um PNG de patrocinador é trocado: muda o endereço e o navegador não usa a versão velha do cache
const VERSAO_LOGOS = 3

/** logo com tamanho pela área do desenho (não do arquivo); patrocinadores sempre no PNG original */
export function Logo({ nome, area, maxW = 9999, maxH = 9999, className }: { nome: LogoNome; area: number; maxW?: number; maxH?: number; className?: string }) {
  const p = nome === 'evento' ? { rc: 1088 / 1103, fw: 1, r: 1088 / 1103 } : P[nome]
  const w = Math.min(Math.sqrt(area * p.rc), maxW, maxH * p.rc) / p.fw
  const src = nome === 'evento' ? asset('kit/logo-colorido.svg') : asset(`logos/${nome}.png?v=${VERSAO_LOGOS}`)
  return <img src={src} alt={nome} draggable={false} className={className} style={{ width: w, height: w / p.r, display: 'block' }} />
}

/** rótulo do kit: caixa alta espaçada com linhas finas dos lados */
export function Rotulo({ texto, largura = 900, tam = 30 }: { texto: string; largura?: number; tam?: number }) {
  return (
    <div className="mx-auto flex items-center" style={{ width: largura, fontSize: tam, gap: '1em' }}>
      <span className="h-1 flex-1 rounded" style={{ background: COR.gelo }} />
      <span className="whitespace-nowrap font-extrabold" style={{ letterSpacing: '.2em', color: COR.eletrico }}>{texto}</span>
      <span className="h-1 flex-1 rounded" style={{ background: COR.gelo }} />
    </div>
  )
}

/** título em duas linhas (azul-noite + royal), como no kit */
export function Titulo({ l1, l2, tam, centro }: { l1: string; l2: string; tam: number; centro?: boolean }) {
  return (
    <div className="font-extrabold" style={{ fontSize: tam, lineHeight: 1.02, textAlign: centro ? 'center' : 'left' }}>
      <span className="block" style={{ color: COR.noite }}>{l1}</span>
      <span className="block" style={{ color: COR.royal }}>{l2}</span>
    </div>
  )
}

// caixa só de posicionamento: sem fundo branco (o Tiago não quer retângulo branco; slide que precisa de branco usa o fundo branco inteiro)
export const cartao = 'flex items-center justify-center'

/** entrada padrão: sobe com mola, com atraso em segundos */
export const sobe = (delay = 0, y = 60) => ({
  initial: { opacity: 0, y, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: 'spring' as const, stiffness: 120, damping: 16, delay },
})

/** depois de entrar, a logo "respira" devagar para a tela não parecer parada */
export function Respira({ children, atraso = 0 }: { children: ReactNode; atraso?: number }) {
  return (
    <motion.div animate={{ scale: [1, 1.035] }} transition={{ duration: 5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: atraso }}>
      {children}
    </motion.div>
  )
}
