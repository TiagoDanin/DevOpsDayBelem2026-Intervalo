// Primeira tela: escolher o intervalo. A escolha fica no endereço (#/fishbowl etc.) para abrir direto depois.
// No card do sorteio se configura o link do convite (vira o QR code; vai no endereço: #/sorteio?u=<link>).
// Nos cards com ordem misturada (patrocinadores, palestrantes) um switch liga/desliga o aleatório; a preferência fica
// no localStorage por intervalo ('aleatorio-<id>'), a mesma que o botão dentro do player usa. Nos cards com opção de comunidades, outro switch
// liga/desliga as comunidades daquele intervalo ('comunidades-<id>'; o padrão vem de data.ts).
import { motion } from 'motion/react'
import { Clock, Layers, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Cena, Logo, Palco, Titulo } from '@/components/base'
import { INTERVALOS } from '@/data'
import Player, { telaCheia } from '@/Player'

function doHash() {
  const [rota, q = ''] = window.location.hash.replace(/^#\/?/, '').split('?')
  return { id: rota, url: new URLSearchParams(q).get('u') ?? '' }
}

/** só aceita link http(s) completo: é o que vira QR code no telão */
function linkValido(t: string) {
  try { const u = new URL(t.trim()); return u.protocol === 'https:' || u.protocol === 'http:' } catch { return false }
}
const ler = (k: string, padrao: string) => { try { return localStorage.getItem(k) ?? padrao } catch { return padrao } }
const grava = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* sem storage: vale só agora */ } }

function duracao(s: number[]) {
  const fixos = s.filter(Number.isFinite)
  if (!fixos.length) return 'contínuo'
  const t = fixos.reduce((a, b) => a + b, 0)
  return fixos.length < s.length ? `para até clicar, depois ${t} s` : `${t} s por volta`
}

export default function App() {
  const [{ id: rotaId, url }, setRota] = useState(doHash)
  // busca o intervalo a cada render (não guarda o objeto): quando data.ts muda, o player já pega os slides novos
  const atual = INTERVALOS.find((x) => x.id === rotaId) ?? null
  const [link, setLink] = useState(() => ler('sorteio-url', ''))
  const [aleatorio, setAleatorio] = useState(() => Object.fromEntries(INTERVALOS.map((x) => [x.id, ler(`aleatorio-${x.id}`, 'sim') !== 'nao'])))
  useEffect(() => {
    const f = () => setRota(doHash())
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  // abriu #/sorteio sem link válido: volta para a escolha, onde o link se configura no card
  useEffect(() => { if (atual?.id === 'sorteio' && !linkValido(url)) window.location.hash = '' }, [atual, url])

  const abre = (id: string) => {
    telaCheia()
    if (id !== 'sorteio') { window.location.hash = `/${id}`; return }
    const l = link.trim()
    grava('sorteio-url', l)
    window.location.hash = `/sorteio?u=${encodeURIComponent(l)}`
  }
  const [comunidades, setComunidades] = useState(() => Object.fromEntries(INTERVALOS.filter((x) => x.comunidades !== undefined)
    .map((x) => [x.id, ler(`comunidades-${x.id}`, x.comunidades ? 'sim' : 'nao') === 'sim'])))
  const [patrocinio, setPatrocinio] = useState(() => Object.fromEntries(INTERVALOS.filter((x) => x.patrocinio).map((x) => [x.id, ler(`patrocinio-${x.id}`, x.patrocinio!)])))
  const mudaPatrocinio = (id: string, v: string) => { setPatrocinio((c) => ({ ...c, [id]: v })); grava(`patrocinio-${id}`, v) }
  const mudaComunidades = (id: string, v: boolean) => { setComunidades((c) => ({ ...c, [id]: v })); grava(`comunidades-${id}`, v ? 'sim' : 'nao') }
  const mudaAleatorio = (id: string, v: boolean) => { setAleatorio((a) => ({ ...a, [id]: v })); grava(`aleatorio-${id}`, v ? 'sim' : 'nao') }

  if (atual && (atual.id !== 'sorteio' || linkValido(url)))
    return <Player key={atual.id + url} intervalo={atual} url={url} sair={() => { window.location.hash = '' }} />

  const linkRuim = link !== '' && !linkValido(link)
  return (
    <Palco>
      <Cena>
        <div className="absolute inset-0 flex flex-col items-center" style={{ paddingTop: 70 }}>
          <motion.div className="flex items-center" style={{ gap: 28 }} initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
            <Logo nome="evento" area={12000} />
            <div>
              <div className="font-extrabold" style={{ fontSize: 18, letterSpacing: '.2em', color: '#0043DF' }}>TELÃO DOS INTERVALOS</div>
              <Titulo l1="QUAL INTERVALO" l2="VAI PASSAR AGORA?" tam={48} />
            </div>
          </motion.div>
          <div className="grid grid-cols-3" style={{ gap: 32, marginTop: 50, width: 1500 }}>
            {INTERVALOS.map((x, i) => {
              const sorteio = x.id === 'sorteio'
              const mistura = x.slides.some((s) => s.mistura)
              const vis = x.slides.filter((s) => !s.comunidade || comunidades[x.id])
              return (
                <motion.div key={x.id} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.15 + i * 0.08 }}>
                  <Card className="h-full gap-4 py-6 shadow-[0_18px_50px_rgba(4,51,120,.12)] ring-0">
                    <CardHeader className="px-8">
                      <CardTitle className="text-[36px] font-extrabold leading-tight text-[#043378]">{x.titulo}</CardTitle>
                      <CardDescription className="text-[20px] leading-snug">{x.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 px-8">
                      <div className="flex gap-3">
                        <Badge variant="secondary" className="h-9 gap-2 px-4 text-[18px]"><Layers className="size-5!" />{vis.length} {vis.length > 1 ? 'slides' : 'slide'}</Badge>
                        <Badge variant="secondary" className="h-9 gap-2 px-4 text-[18px]"><Clock className="size-5!" />{duracao(vis.map((s) => s.s))}</Badge>
                      </div>
                      {mistura && (
                        <div className="flex items-center gap-3">
                          <Switch id={`aleatorio-${x.id}`} checked={aleatorio[x.id]} onCheckedChange={(v) => mudaAleatorio(x.id, v)} className="scale-125" />
                          <Label htmlFor={`aleatorio-${x.id}`} className="text-[20px]">Ordem aleatória</Label>
                        </div>
                      )}
                      {x.patrocinio && (
                        <div className="flex items-center gap-3">
                          <Switch id={`patrocinio-${x.id}`} checked={patrocinio[x.id] === 'dinamico'} onCheckedChange={(v) => mudaPatrocinio(x.id, v ? 'dinamico' : 'estatico')} className="scale-125" />
                          <Label htmlFor={`patrocinio-${x.id}`} className="text-[20px]">Patrocinadores rolando</Label>
                        </div>
                      )}
                      {x.comunidades !== undefined && (
                        <div className="flex items-center gap-3">
                          <Switch id={`comunidades-${x.id}`} checked={comunidades[x.id]} onCheckedChange={(v) => mudaComunidades(x.id, v)} className="scale-125" />
                          <Label htmlFor={`comunidades-${x.id}`} className="text-[20px]">Comunidades</Label>
                        </div>
                      )}
                      {sorteio && (
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="link-sorteio" className="text-[18px]">Link do convite (vira o QR code)</Label>
                          <Input id="link-sorteio" value={link} onChange={(e) => setLink(e.target.value)} className="h-11 text-[18px]"
                            placeholder="https://sorteios.lubien.dev/rooms/…" aria-invalid={linkRuim}
                            onKeyDown={(e) => { if (e.key === 'Enter' && linkValido(link)) abre(x.id) }} />
                          {linkRuim && <p className="text-[16px] text-destructive">Cole o link completo, começando com https://</p>}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="mt-auto px-8 pt-2">
                      <Button className="h-14 w-full text-[22px]" disabled={sorteio && !linkValido(link)} onClick={() => abre(x.id)}>
                        <Play className="size-6!" /> Passar no telão
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Cena>
    </Palco>
  )
}
