// Fishbowl e mesa redonda no loop do intervalo: cena 3D no centro, regra curta em cima trocando junto com o que acontece
// na cena, e os patrocinadores rolando embaixo (como no backdrop).
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { DIAMANTE, ORGANIZACAO, OURO, PRATA, type LogoNome } from '@/data'
import { COR } from '../base'
import { Fishbowl3D } from './fishbowl3d'
import { Mesa3D } from './mesa3d'
import { Linha } from './rolagem'

const LINHA: LogoNome[] = ['evento', ...DIAMANTE, ...OURO, ...PRATA, ...ORGANIZACAO]
// uma regra por fase da cena; **texto** = destaque. lento/atraso fazem um ciclo só caber nos 15 s do slide em 1x
const FORMATOS = {
  fishbowl: {
    titulo: 'FISHBOWL', Cena: Fishbowl3D, lento: 1.4, atraso: 2,
    regras: ['4 cadeiras no palco, 1 sempre livre', 'Quer falar? Sobe e senta na cadeira livre', 'Só quem está no palco fala', '**Quem já falou levanta e dá a vez**'],
  },
  mesa: {
    titulo: 'MESA REDONDA', Cena: Mesa3D, lento: 1.1, atraso: 1.5,
    regras: ['Convidados e mediação juntos à mesa', 'Cada convidado conta como vive o tema', 'A mediação pergunta e passa a palavra', '**No fim, perguntas do público**'],
  },
}

export function SlidePalco({ formato, velocidade }: { formato: keyof typeof FORMATOS; velocidade: number }) {
  const [fase, setFase] = useState(0)
  const { titulo, Cena, lento, atraso, regras } = FORMATOS[formato]
  return (
    <div className="absolute inset-0">
      <div className="absolute left-0 right-0 text-center font-extrabold" style={{ top: 60, fontSize: 26, letterSpacing: '.2em', color: COR.eletrico }}>{titulo}</div>
      <div className="absolute left-0 right-0 flex justify-center" style={{ top: 100, height: 90 }}>
        <AnimatePresence mode="wait">
          <motion.div key={fase} className="font-extrabold" style={{ fontSize: 60, lineHeight: 1.1, color: COR.noite }}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.35 }}>
            {regras[fase].split('**').map((t, k) => (k % 2 ? <span key={k} style={{ color: COR.royal }}>{t}</span> : t))}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 180 }}>
        {/* acompanha a velocidade escolhida no player */}
        <Cena largura={1400} altura={720} zoom={1.18} lento={lento / velocidade} atraso={atraso / velocidade} aoFase={setFase} />
      </div>
      <div className="absolute" style={{ zIndex: 1, top: 905, left: -1200, right: -1200 }}>
        <Linha linha={LINHA} esquerda segPorVolta={30} velocidade={velocidade} />
      </div>
    </div>
  )
}
