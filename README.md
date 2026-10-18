# Portfólio · Josué Balbino Almeida

> Currículo online e portfólio de Desenvolvedor Back-End Java.

🔗 **Acesse:** [joshpcbrrj.github.io](https://joshpcbrrj.github.io)

## Sobre o projeto

Site estático de página única, publicado com GitHub Pages. Reúne experiência profissional, habilidades,
formação, projetos e contatos, além do currículo em PDF para download.

### Tecnologias

- HTML5 semântico
- CSS moderno (custom properties, grid, flexbox, `color-mix`) sem frameworks
- JavaScript puro (sem jQuery ou dependências)

### Funcionalidades

- Galeria de projetos automática: lista os repositórios públicos do GitHub via API, com filtro por linguagem
  (forks ficam de fora; para esconder um repositório, adicione o tópico `ocultar` nele)
- Tema claro/escuro (segue o sistema e lembra a escolha do visitante)
- Layout responsivo, pensado primeiro para celular
- Animações suaves de entrada, respeitando `prefers-reduced-motion`
- Destaque da seção atual no menu
- Metadados Open Graph para uma boa prévia ao compartilhar o link
- Acessibilidade: link "pular para o conteúdo", foco visível e rótulos ARIA

## Estrutura

```
├── index.html        # Página única com todas as seções
├── css/style.css     # Estilos e temas
├── js/main.js        # Tema, menu mobile e animações
├── images/           # Foto e favicon
└── cv/resume.pdf     # Currículo para download
```

## Rodando localmente

Basta abrir o `index.html` no navegador, ou servir a pasta:

```bash
npx serve .
```

## Histórico

A primeira versão deste site foi baseada no template do curso
[Git e GitHub Essencial para o Desenvolvedor](https://www.udemy.com/course/curso-de-git-e-github-essencial/) (Geek University).
Em 2026 o projeto foi reescrito do zero, sem dependências externas.
