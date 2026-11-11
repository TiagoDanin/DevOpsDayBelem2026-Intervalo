// Backdrop na tela: cabeçalho e fundo fixos, as 5 linhas da grade do backdrop de fotos rolando (linhas alternam o sentido).
// Todas as logos do mesmo tamanho, como no backdrop impresso.
import { motion, useAnimationFrame, useMotionValue } from 'motion/react'

import { COMUNIDADES, GRADE_BACKDROP, type LogoNome } from '@/data'
import { COR, Logo, Titulo, asset } from '../base'

// gaivotas dos dois lados do cabeçalho, como no backdrop impresso
export const GAIVOTAS_BACKDROP: [number, number, number][] = [[300, 160, 76], [400, 110, 46], [1540, 120, 76], [1640, 175, 46]]

const CASA = 230               // largura de cada logo na linha

// com comunidades: cada uma entra 2x (menos que a prata, 3x), espalhadas pelas 5 linhas (3, 3, 3, 3 e 4 por linha)
const EXTRA = [...COMUNIDADES, ...COMUNIDADES.slice(4), ...COMUNIDADES.slice(0, 4)]
const POR_LINHA = [3, 3, 3, 3, 4]
function comComunidades(linha: LogoNome[], r: number): LogoNome[] {
  const ini = POR_LINHA.slice(0, r).reduce((a, b) => a + b, 0)
  const extra = EXTRA.slice(ini, ini + POR_LINHA[r])
  const out = [...linha]
  extra.forEach((c, k) => out.splice(Math.round(((k + 1) * out.length) / (extra.length + 1)), 0, c))   // intercala no meio, espaçado
  return out
}

export function SlideRolagem({ velocidade = 1, comunidades = false }: { velocidade?: number; comunidades?: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute left-0 right-0 flex items-center justify-center" style={{ top: 40, gap: 50 }}>
        <Logo nome="evento" area={36000} />
        <span className="block rounded" style={{ width: 5, height: 170, background: COR.ceu }} />
        <div>
          <Titulo l1="DEVOPSDAYS" l2="BELÉM 2026" tam={84} />
          <img src={asset('kit/traco.svg')} style={{ width: 470, marginTop: 8 }} />
        </div>
      </div>
      {/* linhas mais largas que o quadro: em tela mais larga que 16:9 elas vão até a borda da janela */}
      <div className="absolute flex flex-col" style={{ top: 285, gap: 10, left: -1200, right: -1200 }}>
        {GRADE_BACKDROP.map((linha, r) => <Linha key={r} linha={comunidades ? comComunidades(linha, r) : linha} esquerda={r % 2 === 0} segPorVolta={38 + r * 4} velocidade={velocidade} />)}
      </div>
    </div>
  )
}

/** uma linha de logos rolando; anda quadro a quadro para a velocidade mudar na hora, sem reiniciar a posição.
 *  Repete a linha 4 vezes para cobrir a janela mesmo em tela mais larga que 16:9. */
export function Linha({ linha, esquerda, segPorVolta, velocidade }: { linha: LogoNome[]; esquerda: boolean; segPorVolta: number; velocidade: number }) {
  const larg = CASA * linha.length
  const x = useMotionValue(esquerda ? 0 : -larg)
  const pxPorS = larg / segPorVolta
  useAnimationFrame((_, dt) => {
    let v = x.get() + (esquerda ? -1 : 1) * pxPorS * velocidade * (dt / 1000)
    if (v <= -larg) v += larg
    if (v > 0) v -= larg
    x.set(v)
  })
  return (
    <div className="overflow-hidden" style={{ height: 116 }}>
      <motion.div className="flex" style={{ width: larg * 4, x }}>
        {[...linha, ...linha, ...linha, ...linha].map((l, i) => (
          <div key={i} className="flex shrink-0 items-center justify-center" style={{ width: CASA, height: 116 }}>
            <Logo nome={l} area={8000} maxW={165} maxH={96} />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
