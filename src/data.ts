// Patrocinadores, cotas e textos dos intervalos. Textos de fishbowl, mesa redonda e sorteio ficam aqui para ajustar sem mexer nos slides.
export type Patro = 'idopter' | 'vibe' | 'lubien' | 'cesupa' | 'dati' | 'techlead' | 'psd-it' | 'valora' | 'ta-safo'
  | 'elas' | 'devsnorte' | 'aws-belem' | 'gdg-belem' | 'studiocode' | 'pyladies' | 'norte4j' | 'php-belem'
export type LogoNome = Patro | 'evento'

export const NOMES: Record<LogoNome, string> = {
  idopter: 'idopter labs', vibe: 'vibe tecnologia', lubien: 'lubien', cesupa: 'CESUPA', dati: 'dati',
  techlead: 'Techlead', 'psd-it': 'PSD.IT', valora: 'Valora', 'ta-safo': 'Tá safo!', evento: 'DevOpsDays Belém',
  elas: 'Elas na Tecnologia', devsnorte: 'Devs Norte', 'aws-belem': 'AWS User Group Belém', 'gdg-belem': 'GDG Belém',
  studiocode: 'StudioCode', pyladies: 'PyLadies Belém', norte4j: 'Norte4j', 'php-belem': 'PHP Belém',
}

export const DIAMANTE: Patro[] = ['idopter', 'vibe', 'lubien', 'cesupa', 'dati']
export const OURO: Patro[] = ['techlead']
export const PRATA: Patro[] = ['psd-it', 'valora']
export const ORGANIZACAO: Patro[] = ['ta-safo']
// comunidades apoiadoras (abicora.com/devopsdays-belem#sponsors). O Tá safo! também está lá, mas aparece como organização
export const COMUNIDADES: Patro[] = ['elas', 'devsnorte', 'aws-belem', 'gdg-belem', 'studiocode', 'pyladies', 'norte4j', 'php-belem']

// grade do backdrop de fotos (opção B, 5x9), reaproveitada no intervalo com logos rolando
export const GRADE_BACKDROP: LogoNome[][] = [
  ['cesupa', 'idopter', 'psd-it', 'vibe', 'lubien', 'evento', 'techlead', 'dati', 'evento'],
  ['evento', 'vibe', 'cesupa', 'valora', 'dati', 'ta-safo', 'lubien', 'idopter', 'techlead'],
  ['psd-it', 'dati', 'ta-safo', 'lubien', 'evento', 'idopter', 'cesupa', 'evento', 'vibe'],
  ['lubien', 'cesupa', 'evento', 'techlead', 'vibe', 'valora', 'dati', 'ta-safo', 'idopter'],
  ['dati', 'techlead', 'vibe', 'idopter', 'psd-it', 'lubien', 'evento', 'cesupa', 'valora'],
]

// palestras da programação (mesmos dados dos posts: scripts/posts.py), na ordem do dia
export type Palestra = { hora: string; titulo: string; quem: { nome: string; foto: string }[]; papel: string }
export const PALESTRAS: Palestra[] = [
  { hora: '09:45', titulo: 'RecuperAI: automação de recuperação de crédito com Inteligência Artificial', papel: 'Vibe Tecnologia',
    quem: [{ nome: 'Kim Lima de Lima', foto: 'kim.webp' }, { nome: 'Paula Daniele de Oliveira Moreira', foto: 'paula.webp' }] },
  { hora: '10:35', titulo: 'Instalar com 1 clique não é seguro: o que ninguém te conta sobre subir serviços de IA e automação em VPS', papel: 'Comunidade ParaLivre',
    quem: [{ nome: 'José Roberto da Costa Ferreira', foto: 'jose_nova.jpg' }] },
  { hora: '11:05', titulo: 'Escalando a performance do time DevOps usando RAG dinâmico e AWS Bedrock', papel: 'Especialista DevOps',
    quem: [{ nome: 'Bianca Deyse Pinto Ramos', foto: 'bianca.webp' }] },
  { hora: '11:35', titulo: 'Do código ao comportamento: por que IA precisa de uma plataforma própria', papel: 'AI Systems Architect',
    quem: [{ nome: 'Carlos Augusto Oeiras', foto: 'carlos.webp' }] },
  { hora: '14:00', titulo: 'O DevOps vai acabar (e você está fingindo que não vê)', papel: 'Analista de Segurança da Informação',
    quem: [{ nome: 'Cleber Soares', foto: 'cleber.webp' }] },
  { hora: '14:30', titulo: 'Do 0 ao piloto automágico: boas práticas para uso de agentes de IA em produção', papel: 'Senior Cloud Architect',
    quem: [{ nome: 'Erick Eloi Pimenta Pimentel', foto: 'erick.webp' }] },
  { hora: '15:00', titulo: 'O que a gente perde quando para de precisar um do outro', papel: 'Diretor AI & Modernization na Dati',
    quem: [{ nome: 'Marcelo Palladino', foto: 'marcelo.webp' }] },
]

export type Explicacao = { titulo: string; quando: string;   // quando vazio: sem a linha do horário
  passos: string[]; ilustracao: 'fishbowl' | 'mesa' }

// horários da programação (banner de programação): fishbowl 13h15, mesa redonda 16h30
export const FISHBOWL: Explicacao = {
  titulo: 'FISHBOWL', quando: '', ilustracao: 'fishbowl',
  // regras do formato: agiletrendsbr.com/fishbowls e cubus.oitcinterfor.org/fishbowl. **texto** sai em negrito no slide
  passos: [
    'No palco ficam quatro cadeiras: três pessoas conversam e uma cadeira fica sempre livre.',
    'Só quem está no palco fala. A plateia escuta.',
    'Quer entrar? Sobe e senta na cadeira livre. **Quem já falou levanta e dá a vez para o colega.**',
    'Entra quantas vezes quiser, ou só assiste.',
  ],
}

export const MESA_REDONDA: Explicacao = {
  titulo: 'MESA REDONDA', quando: '', ilustracao: 'mesa',
  passos: [
    'Convidados e uma pessoa mediando sentam juntos à mesa.',
    'Cada convidado conta como o tema aparece no dia a dia de onde trabalha.',
    'A mediação faz as perguntas e passa a palavra entre as pessoas.',
    'No fim, abre para perguntas do público.',
  ],
}

// cada intervalo é uma lista de slides que passa em loop; `s` = segundos na tela (Infinity = fica parado).
// `mistura`: slides seguidos com o mesmo valor trocam de ordem a cada volta do loop (se o aleatório estiver ligado)
export type SlideDef = (
  | { tipo: 'diamante'; logo: Patro; n: number; s: number }
  | { tipo: 'cotas'; grupos: { cota: string; logos: Patro[]; area: number }[]; s: number }
  | { tipo: 'evento'; s: number; linha?: boolean }   // linha: patrocinadores rolando embaixo
  | { tipo: 'todos'; s: number; semTitulo?: boolean }
  | { tipo: 'palco'; formato: 'fishbowl' | 'mesa'; s: number }   // cena 3D com regras curtas e patrocinadores rolando
  | { tipo: 'explica'; e: Explicacao; s: number }
  | { tipo: 'rolagem'; s: number }
  | { tipo: 'palestra'; p: Palestra; s: number }
  | { tipo: 'sorteio'; s: number }
) & { mistura?: 'diamante' | 'palestra'; comunidade?: boolean; trocavel?: boolean }
// comunidade: some quando o intervalo está sem comunidades; trocavel: vira o slide de logos rolando quando o patrocínio é 'dinamico'

/** nome do slide no seletor de página */
export function nomeSlide(d: SlideDef): string {
  switch (d.tipo) {
    case 'diamante': return `Diamante: ${NOMES[d.logo]}`
    case 'cotas': return d.comunidade ? 'Comunidades' : d.grupos.map((g) => g.cota.replace('PATROCÍNIO ', '')).join(' e ').toLowerCase().replace(/^./, (c) => c.toUpperCase())
    case 'evento': return 'Logo DevOpsDays'
    case 'todos': return 'Todos os patrocinadores'
    case 'palco': return `${d.formato === 'fishbowl' ? 'Fishbowl' : 'Mesa redonda'}: regras e patrocinadores`
    case 'explica': return `Como funciona: ${d.e.titulo.toLowerCase()}`
    case 'rolagem': return 'Logos rolando'
    case 'sorteio': return 'Sorteio (QR code)'
    case 'palestra': return `Palestra ${d.p.hora}: ${d.p.quem.map((q) => q.nome.split(' ')[0]).join(' e ')}`
  }
}

// comunidades: o intervalo tem a opção de mostrar as comunidades; o valor é o padrão (ligado/desligado)
// inicioLoop: índice do slide onde o loop recomeça (os anteriores passam só uma vez)
// patrocinio: o intervalo deixa escolher o slide de patrocinadores estático (cotas) ou dinâmico (logos rolando); o valor é o padrão
export type Intervalo = { id: string; titulo: string; descricao: string; slides: SlideDef[]; comunidades?: boolean; inicioLoop?: number; patrocinio?: 'estatico' | 'dinamico' }

// fishbowl e mesa redonda: explicação parada até clicar (passa uma vez só) e depois o loop na ordem pedida pelo Tiago:
// patrocinadores, cena, logo, patrocinadores, cena, patrocinadores, cena, cena
function formula(id: string, titulo: string, e: Explicacao): Intervalo {
  const formato = e.ilustracao
  return {
    id, titulo, descricao: `Explicação parada até clicar; depois patrocinadores, ${titulo.toLowerCase()} animado e o logo do evento.`,
    inicioLoop: 1, patrocinio: 'estatico',
    slides: [{ tipo: 'explica', e, s: Infinity }, ...(['P', 'C', 'L', 'P', 'C', 'P', 'C', 'C'] as const).map((k): SlideDef =>
      k === 'P' ? { tipo: 'todos', s: 10, semTitulo: true, trocavel: true } : k === 'C' ? { tipo: 'palco', formato, s: 15 } : { tipo: 'evento', s: 8, linha: true })],
  }
}
// sequência de patrocínio: logo do evento, cada diamante (ordem misturada), todos os diamantes, ouro e prata, organização
const PATROCINIO: SlideDef[] = [
  { tipo: 'evento', s: 7 },
  ...DIAMANTE.map((logo, i): SlideDef => ({ tipo: 'diamante', logo, n: i + 1, s: 7, mistura: 'diamante' })),
  { tipo: 'cotas', grupos: [{ cota: 'PATROCÍNIO DIAMANTE', logos: DIAMANTE, area: 26000 }], s: 8 },
  { tipo: 'cotas', grupos: [{ cota: 'OURO', logos: OURO, area: 34000 }, { cota: 'PRATA', logos: PRATA, area: 20000 }], s: 7 },
  { tipo: 'cotas', grupos: [{ cota: 'COMUNIDADES APOIADORAS', logos: COMUNIDADES, area: 20000 }], s: 9, comunidade: true },
  { tipo: 'cotas', grupos: [{ cota: 'ORGANIZAÇÃO', logos: ORGANIZACAO, area: 50000 }], s: 6 },
]

export const INTERVALOS: Intervalo[] = [
  { id: 'patrocinadores', titulo: 'Patrocinadores', descricao: 'Logo do evento, cada diamante, todos os diamantes, ouro e prata, comunidades e organização.', slides: PATROCINIO, comunidades: false },
  {
    id: 'patrocinador-palestrante', titulo: 'Patrocinador e palestrante', descricao: 'Patrocinadores, depois cada palestra com quem fala e o horário.',
    slides: [...PATROCINIO, { tipo: 'evento', s: 7 }, ...PALESTRAS.map((p): SlideDef => ({ tipo: 'palestra', p, s: 10, mistura: 'palestra' }))],  // sem logo no fim: o loop já recomeça nele
    comunidades: true,
  },
  formula('fishbowl', 'Fishbowl', FISHBOWL),
  formula('mesa-redonda', 'Mesa redonda', MESA_REDONDA),
  { id: 'sorteio', titulo: 'Sorteio', descricao: 'QR code do convite do sorteio, com confete e patrocinadores rolando embaixo.', slides: [{ tipo: 'sorteio', s: Infinity }] },
  { id: 'backdrop', titulo: 'Backdrop', descricao: 'Fundo fixo do backdrop com as logos dos patrocinadores rolando na tela.', slides: [{ tipo: 'rolagem', s: Infinity }], comunidades: false },
]
