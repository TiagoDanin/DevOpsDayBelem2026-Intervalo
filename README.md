# DevOpsDays Belém 2026 · Intervalos

Telão dos intervalos do DevOpsDays Belém 2026 (14/11/2026, CESUPA, Belém-PA). A primeira tela escolhe o intervalo e cada um passa em loop no telão.

| Intervalo | O que passa |
|---|---|
| Patrocinadores | logo do evento, cada diamante, todos os diamantes, ouro e prata, comunidades (opcional) e organização |
| Patrocinador e palestrante | a sequência de patrocinadores e depois cada palestra, com foto, horário e quem fala |
| Fishbowl | explicação parada até clicar; depois patrocinadores, cena 3D com as regras e o logo |
| Mesa redonda | o mesmo formato do fishbowl, com a cena da mesa |
| Sorteio | QR code do link do convite, confete e patrocinadores rolando |
| Backdrop | cabeçalho fixo e as logos rolando, como no backdrop impresso |

As opções de cada intervalo (ordem aleatória, comunidades, patrocinadores rolando, link do sorteio) ficam no card da tela inicial e são salvas no navegador.

## No telão

- Clique na tela ou → passa para o próximo slide, ← volta, espaço pausa, F põe em tela cheia, Esc volta para a escolha.
- Os controles do canto (página, velocidade, aleatório) aparecem quando o mouse mexe.
- Cada intervalo abre direto pelo endereço, por exemplo `#/fishbowl`.

## Rodar

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # versão estática em dist/
```

Feito com React, Vite, Tailwind, shadcn/ui, Motion e three.js. Cada push na `main` publica no GitHub Pages pelo workflow `.github/workflows/pages.yml`.

Os logos dos patrocinadores e das comunidades são os arquivos originais enviados por cada um.
