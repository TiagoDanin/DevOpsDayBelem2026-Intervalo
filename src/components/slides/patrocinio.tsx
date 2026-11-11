// Slides de patrocínio: destaque de um diamante, grupos de cotas, todos os patrocinadores e o logo do evento.
import { motion } from 'motion/react'
import { DIAMANTE, ORGANIZACAO, OURO, PRATA, type LogoNome, type Patro } from '@/data'
import { Linha } from './rolagem'

const LINHA_PATROCINIO: LogoNome[] = ['evento', ...DIAMANTE, ...OURO, ...PRATA, ...ORGANIZACAO]
import { asset, cartao, COR, Logo, Respira, Rotulo, sobe, Titulo } from '../base'

// pt: espaço do logo do evento fixo no topo (Player)
const centro = 'absolute inset-0 flex flex-col items-center justify-center pt-[150px]'

export function SlideDiamante({ logo, n }: { logo: Patro; n: number }) {
  return (
    <div className={centro} style={{ gap: 70 }}>
      <motion.div {...sobe(0, -30)}><Rotulo texto="PATROCÍNIO DIAMANTE" largura={980} /></motion.div>
      <motion.div {...sobe(0.25, 90)} className={cartao} style={{ width: 1000, height: 460 }}>
        <Respira atraso={1}><Logo nome={logo} area={110000} maxW={720} maxH={330} /></Respira>
      </motion.div>
      <motion.div {...sobe(0.6, 20)} className="flex gap-[18px]">
        {DIAMANTE.map((_, i) => (
          <motion.span key={i} className="block h-4 rounded-full" initial={false}
            animate={{ width: i + 1 === n ? 52 : 16, background: i + 1 === n ? COR.royal : COR.gelo }} transition={{ duration: 0.4 }} />
        ))}
      </motion.div>
    </div>
  )
}

/** um ou mais grupos de cota lado a lado, cada logo no seu cartão */
export function SlideCotas({ grupos }: { grupos: { cota: string; logos: Patro[]; area: number }[] }) {
  let i = 0
  const muitos = grupos.reduce((t, g) => t + g.logos.length, 0) > 3
  const card = muitos ? { w: 320, h: 220 } : { w: 520, h: 300 }
  return (
    <div className={centro} style={{ gap: 90 }}>
      <div className="flex items-start" style={{ gap: 110 }}>
        {grupos.map((g, j) => (
          <div key={g.cota} className="flex flex-col items-center" style={{ gap: 60 }}>
            <motion.div {...sobe(j * 0.2, -30)}><Rotulo texto={g.cota} largura={Math.min(1400, Math.max(520, g.logos.length * (card.w + 40)))} /></motion.div>
            <div className="flex flex-wrap justify-center" style={{ gap: 40, maxWidth: 1400 }}>
              {g.logos.map((l) => {
                const d = 0.3 + i++ * 0.15
                return (
                  <motion.div key={l} {...sobe(d, 90)} className={cartao} style={{ width: card.w, height: card.h }}>
                    <Respira atraso={d}><Logo nome={l} area={g.area} maxW={card.w - 80} maxH={card.h - 80} /></Respira>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** todos os patrocinadores por cota, diamante em cima e maior */
export function SlideTodos({ semTitulo }: { semTitulo?: boolean }) {
  const baixo = [{ nome: 'OURO', logos: OURO, w: 400 }, { nome: 'PRATA', logos: PRATA, w: 600 }, { nome: 'ORGANIZAÇÃO', logos: ORGANIZACAO, w: 400 }]
  return (
    <div className={centro} style={{ gap: 44 }}>
      {!semTitulo && <motion.div {...sobe(0, -40)}><Titulo l1="OBRIGADO A QUEM" l2="PATROCINOU O EVENTO" tam={84} centro /></motion.div>}
      <motion.div {...sobe(0.3)} className="flex flex-col" style={{ width: 1580, padding: '34px 40px 40px', gap: 26 }}>
        <Rotulo texto="DIAMANTE" largura={1500} tam={22} />
        <div className="flex items-center justify-around" style={{ minHeight: 130 }}>
          {DIAMANTE.map((l, i) => (
            <motion.div key={l} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 130, damping: 17, delay: 0.5 + i * 0.12 }}>
              <Logo nome={l} area={17000} maxW={250} maxH={130} />
            </motion.div>
          ))}
        </div>
      </motion.div>
      <div className="flex" style={{ gap: 40 }}>
        {baixo.map((c, j) => (
          <motion.div key={c.nome} {...sobe(1.1 + j * 0.15)} className="flex flex-col" style={{ width: c.w, padding: '30px 30px 36px', gap: 22 }}>
            <Rotulo texto={c.nome} largura={c.w - 60} tam={20} />
            <div className="flex items-center justify-around" style={{ minHeight: 90 }}>
              {c.logos.map((l) => <Logo key={l} nome={l} area={9000} maxW={220} maxH={90} />)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/** logo do evento grande, com o Ver-o-Peso subindo atrás */
/** linha: patrocinadores rolando embaixo (como no fishbowl); o resto sobe para dar espaço */
export function SlideEvento({ linha, velocidade = 1 }: { linha?: boolean; velocidade?: number }) {
  return (
    <div className="absolute inset-0">
      <motion.img src={asset('kit/ver-o-peso.svg')} className="absolute right-0" style={{ bottom: linha ? 190 : 0, width: linha ? 860 : 1000, maskImage: 'linear-gradient(90deg, transparent 0%, #000 32%, #000 82%, transparent 100%)' }}
        initial={{ opacity: 0, y: 160 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.2 }} />
      <div className="absolute flex flex-col" style={{ left: 150, top: linha ? 100 : 150, width: 860 }}>
        <motion.div initial={{ opacity: 0, scale: 0.6, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 110, damping: 12 }}>
          <Respira><Logo nome="evento" area={linha ? 100000 : 160000} /></Respira>
        </motion.div>
        <motion.div {...sobe(0.5, 40)} className="mt-10"><Titulo l1="DEVOPSDAYS" l2="BELÉM 2026" tam={linha ? 84 : 100} /></motion.div>
        <motion.img src={asset('kit/traco.svg')} style={{ width: 640, marginTop: 20, transformOrigin: '0 50%' }}
          initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.9, duration: 0.6 }} />
        <motion.div {...sobe(1.2, 20)} className="mt-8 font-bold" style={{ fontSize: 30, color: COR.texto }}>14 NOV 2026 &nbsp;·&nbsp; CESUPA · BELÉM-PA</motion.div>
      </div>
      {linha && (
        <div className="absolute" style={{ zIndex: 1, top: 905, left: -1200, right: -1200 }}>
          <Linha linha={LINHA_PATROCINIO} esquerda segPorVolta={30} velocidade={velocidade} />
        </div>
      )}
    </div>
  )
}
