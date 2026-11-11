// Slide que explica um formato (fishbowl, mesa redonda): texto à esquerda, ilustração animada em loop à direita.
import { motion } from 'motion/react'
import type { Explicacao } from '@/data'
import { asset, cartao, COR, sobe } from '../base'
import { Fishbowl3D } from './fishbowl3d'
import { Mesa3D } from './mesa3d'

const ILUS = { fishbowl: Fishbowl3D, mesa: Mesa3D }

export function SlideExplica({ e }: { e: Explicacao }) {
  const Ilus = ILUS[e.ilustracao]
  return (
    <div className="absolute inset-0">
      <div className="absolute flex flex-col" style={{ left: 150, top: 200, width: 790 }}>
        {e.quando && <motion.div {...sobe(0, -20)} className="font-extrabold" style={{ fontSize: 28, letterSpacing: '.2em', color: COR.eletrico }}>{e.quando}</motion.div>}
        <motion.div {...sobe(0.15, 40)} className="font-extrabold" style={{ fontSize: e.titulo.length > 10 ? 96 : 120, lineHeight: 1, color: COR.noite, marginTop: 14 }}>{e.titulo}</motion.div>
        <motion.img src={asset('kit/traco.svg')} style={{ width: 520, marginTop: 18, transformOrigin: '0 50%' }}
          initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.5, duration: 0.6 }} />
        <div className="flex flex-col" style={{ marginTop: 44, gap: 26 }}>
          {e.passos.map((p, i) => (
            <motion.div key={i} className="flex items-center" style={{ gap: 28 }}
              initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 110, damping: 16, delay: 0.9 + i * 0.6 }}>
              <span className="flex shrink-0 items-center justify-center rounded-full font-extrabold text-white" style={{ width: 64, height: 64, fontSize: 30, background: COR.royal }}>{i + 1}</span>
              <span className="font-semibold" style={{ fontSize: 33, lineHeight: 1.22, color: COR.noite }}>
                {p.split('**').map((t, k) => (k % 2 ? <strong key={k} className="font-extrabold" style={{ color: COR.royal }}>{t}</strong> : t))}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      <motion.div {...sobe(0.4, 80)} className={`${cartao} absolute`} style={{ right: 130, top: 160, width: 720, height: 780 }}>
        <Ilus />
      </motion.div>
    </div>
  )
}
