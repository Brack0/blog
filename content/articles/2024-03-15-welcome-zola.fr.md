+++
title = "Bienvenue Zola !"

[taxonomies]
tags = ["Zola", "Rust", "Contenu"]
+++

Un petit changement pour vous, un grand changement pour moi : je passe à [Zola](https://www.getzola.org/) pour mon blog personnel. C'est mon premier article de blog avec Zola. J'utilise également un nouveau thème, ce qui m'a aussi convaincu de changer. [Docusaurus](https://docusaurus.io/) (précédente stack utilisée pour ce blog) est bien adapté à la documentation (technique), mais pas si élégant pour le blogging (avis personnel).

<!-- more -->

## About Docusaurus

J'ai commencé mon blog début 2022. Mes exigences étaient simples : une solution open source (et gratuite) basée sur quelque chose que je connaissais. J'ai découvert Docusaurus via la documentation d'outils que j'utilise, comme Jest. Il vient avec tout ce dont j'ai besoin dès le départ et de nombreuses fonctionnalités que je peux configurer plus tard. Ces fonctionnalités incluent l'i18n, le SEO, les plugins, le Markdown étendu (MDX, Front matter, remark, etc).

Comme beaucoup de développeurs, j'adore programmer. Cependant, cela peut amener à apprécier les outils plus que les applications construites avec eux. Cela va à l'encontre d'une approche pragmatique. Je voulais corriger ça pour mon blog. Quand on travaille sur des projets personnels, le chemin ET la destination comptent, car on apprend beaucoup et on obtient quelque chose au final (en quelque sorte, [insérez ici le meme du projet perso jamais terminé]). Mais quand il s'agit de blogging, le chemin c'est écrire des articles, pas construire la meilleure application de blogging. C'était l'objectif principal quand j'ai lancé mon blog.

J'ai choisi Docusaurus parce que je pouvais me concentrer sur le contenu (articles, épisodes de podcast, etc) plutôt que sur le projet lui-même. Par exemple, j'étais en mesure d'écrire et de déployer en production des articles avec uniquement un accès à un IDE web. Écrire du texte ou du markdown et produire du HTML/CSS/JS, c'est ce que j'attends d'un générateur de sites statiques.

## About Zola

Avant de plonger dans Zola, laissez-moi expliquer pourquoi j'explorais d'autres options. Je vais être honnête, je suis fatigué que les frameworks JS soient le [golden hammer](https://en.wikipedia.org/wiki/Law_of_the_instrument) du web. J'adore travailler sur le Frontend, notamment avec Angular. Devrais-je utiliser Angular pour chaque projet qui écrit des balises HTML ? Non, évidemment. Devrais-je utiliser React pour un blog ? Je pourrais, mais ce n'est pas nécessaire. Je n'ai pas besoin de JS ici, ou peut-être juste quelques snippets pour des interactions mineures. Un vrai générateur de sites statiques est suffisant pour bloguer.

La deuxième raison est liée à la partie visuelle. Un seul thème Docusaurus est prêt pour la production. Pas un seul n'a été ajouté depuis le début de Docusaurus. Le thème par défaut peut être personnalisé, mais tout le monde se retrouve globalement avec le même design. Le mien me lasse depuis un moment. J'ai donc cherché un outil disposant de plusieurs thèmes et permettant de construire facilement le sien.

_Ne vous méprenez pas, on peut personnaliser Docusaurus avec une technique appelée [Swizzling](https://docusaurus.io/docs/swizzling), mais c'est risqué. On peut remplacer des composants de mise en page par sa propre implémentation. Puisque ces composants peuvent avoir des changements non rétrocompatibles (props, renommage, découpage, etc), il faut vérifier et peut-être corriger manuellement chaque composant de mise en page personnalisé. Personne n'a le temps pour ça !_

Pourquoi Zola alors ? Je ne vais pas mentir, je suis dans le hype train Rust 🦀 (Rust mentionné BTW). Un moteur Rust était une exigence secrète pour ce blog. Je n'ai pas à gérer `node`, `node_modules` et les dépendances. Une solution simple, directe, plusieurs thèmes, tout en un. C'est exactement ce qu'il me faut.

## The blog setup

Pas vraiment un guide ni un tutoriel, mais simplement la façon dont j'ai configuré Zola et l'ai mis en marche.

### Install Zola on Linux

Voici comment j'ai installé Zola sur ParrotOS (un fork Debian/Ubuntu)

```sh
# Get last release from https://github.com/getzola/zola/releases
wget https://github.com/getzola/zola/releases/download/v0.18.0/zola-v0.18.0-x86_64-unknown-linux-gnu.tar.gz

# Quick and dirty "install"
tar xvzf zola-v0.18.0-x86_64-unknown-linux-gnu.tar.gz
sudo cp zola /usr/local/bin
```

### Get started

```sh
zola init myblog
```

```txt
> What is the URL of your site? (https://example.com): https://brack0.dev
> Do you want to enable Sass compilation? [Y/n]: Y
> Do you want to enable syntax highlighting? [y/N]: Y
> Do you want to build a search index of the content? [y/N]: N
```

### Import an awesome theme

```sh
git submodule add https://github.com/pawroman/zola-theme-terminimal.git themes/terminimal
```

```toml
# https://github.com/pawroman/zola-theme-terminimal
theme = "terminimal"
```

### Tweaks

L'un des effets de bord de la définition de l'URL de production lors de `zola init` est que la base URL est définie dans la config. Tous les liens seront alors construits à partir de cette base URL. Ce n'est pas ce qu'on veut quand on a plusieurs environnements avec plusieurs URLs/domaines. Je suis revenu à `base_url = "/"` dans la config pour obtenir des liens absolus sans supposer de domaine. Cependant, certaines balises meta requièrent des URLs absolutes, comme canonical et alternates. J'ai créé une valeur supplémentaire dans la config : `site_url = "https://brack0.dev"` pour construire des URLs absolues.

```txt
> What is the URL of your site? (https://example.com): https://brack0.dev
  ➡️ Will produce ```base_url = "https://brack0.dev"``` in config.toml
```

Ma commande de lancement pour le développement, car je travaille sur un serveur distant (serveur Linux sur le réseau local).

```sh
# Add base-url="/" because base-url is "http://127.0.0.1:1111" when I'm using the dev server
zola serve --base-url /
```

## What's next ?

### Style / Design

J'ai déplacé le thème Terminimal dans la codebase, ce qui me permet de modifier les choses qui ne me conviennent pas. Vous pouvez voir ci-dessous du CSS pour les titres. Les tailles de police sont trop proches les unes des autres et on ne les distingue pas très bien. Quoi qu'il en soit, j'ai effectué quelques mises à jour du design pour correspondre à mes attentes (visuel, accessibilité, etc).

```css
h1 {
  font-size: 1.4rem;
}

h2 {
  font-size: 1.3rem;
}

h3 {
  font-size: 1.2rem;
}

h4, h5, h6 {
  font-size: 1.15rem;
}
```

### A11Y (Accessibility)

Il y avait plusieurs problèmes à corriger dans le thème, comme plusieurs H1. L'accessibilité est plus simple pour le blogging car on a beaucoup de contenu textuel structuré et peu d'éléments complexes comme des menus déroulants, des modales, des carrousels, etc. Une fois les couleurs et les contrastes mis à jour, j'ai utilisé des outils ([WAVE](https://wave.webaim.org/extension/) et [AXE](https://www.deque.com/get-started-axe-devtools-browser-extension/)) pour détecter et corriger les problèmes restants.

### Migrate content from previous blog

À quelques exceptions près, c'était assez facile. En gros, ça se passe comme ça : copier les fichiers [MDX](https://mdxjs.com/), mettre à jour le front matter (l'en-tête Markdown avec des métadonnées), remplacer les composants React par des [shortcodes](https://www.getzola.org/documentation/content/shortcodes/) Zola, apporter quelques finitions et c'est tout.

J'ai également créé des shortcodes pour les [admonitions](https://docusaurus.io/docs/markdown-features/admonitions) et les blocs de code. Les admonitions n'existent pas en markdown natif et les blocs de code ne permettent pas d'afficher un titre (ce qui est vraiment utile à mon avis).

Un comportement sympa de Zola est que toutes les traductions d'un fichier markdown se trouvent à côté de l'original (l'anglais dans mon cas). Dans Docusaurus, les articles originaux étaient derrière `/blog` et les traductions cachées dans `/i18n/[locale]/docusaurus-plugin-content-blog`. C'est aussi plus pratique de configurer deux contenus séparés (articles et épisodes de podcast) avec le SEO et le RSS.

## Conclusion

Et voilà ! Si vous lisez ceci, vous êtes sur mon nouveau blog généré par Zola. J'espère que vous l'apprécierez. Aucun JavaScript inclus, construit avec Rust (encore une mention de Rust, let's go) et blazingly fast.

Adieu Nebulon. So Long, and Thanks for All the Fish 👋.
