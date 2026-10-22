# Jardim da Cecília — MVP 1

Convite digital demonstrativo para o primeiro aniversário da Cecília.

## Foto da Cecília

Coloque a foto na raiz do projeto como `cecilia.jpg` (ou altere `CONFIG.foto` em `index.html`). Ela aparece recortada na moldura de flor; sem a foto, a moldura mostra margaridas.

## Como testar

Abra `index.html` em um navegador moderno. A página é estática e não precisa de build ou variáveis de ambiente.

## Incluído nesta versão

- Layout responsivo com paleta rosa Ballet (`#F6D6DA`), amarelo suave e creme.
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
