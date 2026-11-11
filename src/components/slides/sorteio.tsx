// Sorteio no telão: "SORTEIO" em cima, QR code grande do convite (link digitado ao abrir o intervalo), confete caindo
// e uma linha de patrocinadores rolando embaixo, como no backdrop.
import { motion } from 'motion/react'
import { QRCodeSVG } from 'qrcode.react'
import { DIAMANTE, ORGANIZACAO, OURO, PRATA, type LogoNome } from '@/data'
import { COR } from '../base'
import { Linha } from './rolagem'

const LINHA: LogoNome[] = ['evento', ...DIAMANTE, ...OURO, ...PRATA, ...ORGANIZACAO]
const CORES = [COR.royal, COR.ceu, '#37B1FE', COR.noite, '#45FFDA']

function Confete() {
  return (
    <div className="pointer-events-none absolute" style={{ left: -1200, right: -1200, top: 0, bottom: 0, zIndex: 0 }}>
      {/* espalhado por 4320 px (o quadro de 1920 e 1200 de cada lado), para cobrir tela mais larga que 16:9 */}
      {Array.from({ length: 200 }, (_, i) => (
        <motion.span key={i} className="absolute block rounded-sm"
          style={{ left: (i * 233) % 4320, top: -40, width: 14 + (i % 3) * 4, height: 24, background: CORES[i % CORES.length] }}
          animate={{ y: [0, 1180], rotate: [0, 360 + (i % 4) * 140], x: [0, ((i % 5) - 2) * 40] }}
          transition={{ duration: 4 + (i % 6) * 0.7, repeat: Infinity, ease: 'linear', delay: -((i * 0.53) % 6) }} />
      ))}
    </div>
  )
}

export function SlideSorteio({ url, velocidade }: { url: string; velocidade: number }) {
  return (
    <div className="absolute inset-0">
      <Confete />
      <motion.div className="absolute left-0 right-0 text-center font-extrabold" style={{ zIndex: 1, top: 80, fontSize: 80, lineHeight: 1, color: COR.noite }}
        initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 14 }}>
        SORTEIO
      </motion.div>
      <motion.div className="absolute left-1/2 flex flex-col items-center" style={{ zIndex: 1, top: 195, x: '-50%' }}
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 110, damping: 14, delay: 0.2 }}>
        <div className="rounded-[36px] bg-white" style={{ padding: 28, border: `8px solid ${COR.royal}` }}>
          <QRCodeSVG value={url} size={540} fgColor={COR.noite} marginSize={0} level="M" />
        </div>
        <div className="whitespace-nowrap font-bold" style={{ marginTop: 18, fontSize: url.length > 80 ? 24 : 28, color: COR.texto }}>{url}</div>
      </motion.div>
      <div className="absolute" style={{ zIndex: 1, top: 900, left: -1200, right: -1200 }}>
        <Linha linha={LINHA} esquerda segPorVolta={30} velocidade={velocidade} />
      </div>
    </div>
  )
}
