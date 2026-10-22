# Jardim da Cecília — MVP 1

Convite digital demonstrativo para o primeiro aniversário da Cecília.

## Foto da Cecília

Coloque a foto na raiz do projeto como `cecilia.jpg` (ou altere `CONFIG.foto` em `index.html`). Ela aparece recortada na moldura de flor; sem a foto, a moldura mostra margaridas.

## Painel administrativo (oculto)

Acesse `seusite.vercel.app/admin` — não há link para ele no convite e ele não aparece no Google.
Lá você cadastra convites **em grupo** (família, vários nomes) ou **individuais**; cada convite gera um código `CEC-XXXXX`
que o convidado digita no convite para confirmar presença. Dá para copiar a mensagem pronta ou enviar direto pelo WhatsApp.

Configuração (uma vez, na Vercel → Settings → Environment Variables):
- `DATABASE_URL`: string de conexão do Neon (banco `cecilia`).

As contas do painel ficam na tabela `admin_users` do banco, com a senha guardada só como hash (scrypt).
Para criar as tabelas, rode `db/schema.sql` no SQL Editor do Neon.

## Como testar

Abra `index.html` em um navegador moderno. A página é estática e não precisa de build ou variáveis de ambiente.

## Incluído nesta versão

- Layout responsivo em tons pastel: rosa bebê, amarelo bebê e off-white.
- Animações CSS de margaridas/abelhinhas decorativas e transições ao rolar a página; respeita `prefers-reduced-motion`.
- Frase principal: “Há 1 ano o jardim dos meus pais está em flor”.
- Detalhes demonstrativos do evento, contagem regressiva, atalho do Google Maps e download de evento `.ics` para calendário.
- RSVP de demonstração com código `CEC-8K2P`, integrantes Ana, Carlos, Beatriz e Pedro, e seleção individual.

## Limitações que não devem ser confundidas com produção

- Data, endereço e nomes são demonstrativos e precisam ser confirmados.
- RSVP ainda não persiste no banco de dados nem envia respostas ao administrador.
- Não há painel administrativo, autenticação, geração real de códigos ou proteção de dados nesta versão.
- O botão de som produz tons sintéticos suaves; ainda não é uma gravação real de floresta/passarinhos.
- A personagem usa um emoji provisório. A arte aprovada da Cecília deve ser adicionada como asset e conferida para ter exatamente quatro dentinhos visíveis (dois superiores e dois inferiores).

## Próxima etapa

Migrar a experiência para uma aplicação com banco PostgreSQL (Neon), painel administrativo protegido e RSVP persistente. Validar a arte final e os dados reais antes de publicar o convite aos convidados.
