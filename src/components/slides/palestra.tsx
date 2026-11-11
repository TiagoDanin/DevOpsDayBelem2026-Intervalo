// Slide de uma palestra: foto(s) em círculo com anel do kit à esquerda; horário, título, quem fala e papel à direita.
import { motion } from 'motion/react'
import type { Palestra } from '@/data'
import { asset, COR, Respira, sobe } from '../base'

function Foto({ foto, d, atraso }: { foto: string; d: number; atraso: number }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 110, damping: 14, delay: atraso }}
      className="shrink-0 rounded-full" style={{ width: d, height: d, padding: d * 0.045, background: '#37B1FE' }}>
      <div className="h-full w-full rounded-full bg-white" style={{ padding: d * 0.03 }}>
        <img src={asset(`fotos/${foto}`)} alt="" draggable={false} className="h-full w-full rounded-full object-cover" style={{ objectPosition: 'center 25%' }} />
      </div>
    </motion.div>
  )
}

export function SlidePalestra({ p }: { p: Palestra }) {
  const dupla = p.quem.length > 1
  const tamTitulo = p.titulo.length > 90 ? 54 : p.titulo.length > 60 ? 62 : 72
  return (
    <div className="absolute inset-0 flex items-center" style={{ paddingTop: 120, paddingLeft: 170, paddingRight: 150, gap: 90 }}>
      <Respira atraso={1}>
        <div className="flex items-center" style={{ width: 560, justifyContent: 'center' }}>
          {dupla
            ? <><Foto foto={p.quem[0].foto} d={340} atraso={0.1} /><div style={{ marginLeft: -60 }}><Foto foto={p.quem[1].foto} d={340} atraso={0.3} /></div></>
            : <Foto foto={p.quem[0].foto} d={480} atraso={0.1} />}
        </div>
      </Respira>
      <div className="flex flex-1 flex-col">
        <motion.div {...sobe(0.2, -20)} className="font-extrabold" style={{ fontSize: 30, letterSpacing: '.2em', color: COR.eletrico }}>
          PALESTRA · {p.hora.replace(':', 'H')}
        </motion.div>
        <motion.div {...sobe(0.35, 40)} className="font-extrabold" style={{ fontSize: tamTitulo, lineHeight: 1.08, color: COR.noite, marginTop: 18 }}>
          {p.titulo}
        </motion.div>
        <motion.img src={asset('kit/traco.svg')} style={{ width: 420, marginTop: 26, transformOrigin: '0 50%' }}
          initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.8, duration: 0.6 }} />
        <motion.div {...sobe(1, 20)} style={{ marginTop: 30 }}>
          {p.quem.map((q) => <div key={q.nome} className="font-bold" style={{ fontSize: 38, lineHeight: 1.25, color: COR.royal }}>{q.nome}</div>)}
          <div className="font-semibold" style={{ fontSize: 30, color: COR.texto, marginTop: 8 }}>{p.papel}</div>
        </motion.div>
      </div>
    </div>
  )
}
