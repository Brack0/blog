+++
title = "Bienvenue à Zola !"

[taxonomies]
tags = ["Zola", "Rust", "Content"]
+++

Un petit changement pour vous, un grand changement pour moi : je passe à [Zola](https://www.getzola.org/) pour mon blog personnel. C'est mon premier article rédigé avec Zola. J'ai aussi adopté un nouveau thème, qui m'a d'ailleurs convaincu de changer. [Docusaurus](https://docusaurus.io/) convient très bien à la documentation (technique), mais il manque d'élégance pour le blogging (mon avis).

<!-- more -->

## À propos de Docusaurus

J'ai commencé mon blog début 2022. Mes exigences étaient simples : une solution open source (et gratuite) basée sur quelque chose que je connaissais. J'ai découvert Docusaurus via la documentation d'outils que j'utilise, comme Jest. Il embarque tout ce dont j'ai besoin et de nombreuses fonctionnalités que je pourrai configurer plus tard : i18n, SEO, plugins, Markdown étendu (MDX, Front matter, remark, etc.).

Comme beaucoup de développeurs, j'aime programmer. Mais cela peut conduire à accorder plus d'importance aux outils qu'aux applications qu'on construit avec eux. C'est l'opposé d'une approche pragmatique. Je voulais corriger ça pour mon blog. Quand on travaille sur des projets annexes, le chemin ET la destination comptent, car on apprend beaucoup et on obtient quelque chose au bout (en quelque sorte, [insérer ici le mème sur le projet non terminé]). Mais quand il s'agit de blogging, le chemin, c'est écrire des articles, pas construire la meilleure application de blog. C'était l'objectif principal quand j'ai lancé mon blog.

J'ai choisi Docusaurus car il me permettait de me concentrer sur le contenu (articles, épisodes de podcast, etc.) plutôt que sur le projet lui-même. Par exemple, j'ai pu rédiger et déployer en production des articles avec uniquement l'IDE web. Écrire du texte ou du Markdown et produire du HTML/CSS/JS : c'est ce que j'attends d'un générateur de sites statiques.

## À propos de Zola

Avant de plonger dans Zola, laissez-moi expliquer pourquoi j'explorais d'autres options. Soyons honnêtes : je suis fatigué que les frameworks JS soient le [marteau doré](https://fr.wikipedia.org/wiki/Loi_de_l%27instrument) du web. J'adore travailler sur le Frontend, surtout avec Angular. Mais dois-je utiliser Angular pour chaque projet qui écrit des balises HTML ? Non, évidemment. Dois-je utiliser React pour un blog ? Je pourrais, mais ce n'est pas nécessaire. Je n'ai pas besoin de JS ici, ou alors juste quelques extraits pour des interactions mineures. Un vrai générateur de sites statiques suffit pour bloguer.

La deuxième raison concerne la partie visuelle. Un seul thème Docusaurus est prêt pour la production. Pas un seul thème n'a été ajouté depuis le lancement de Docusaurus. Le thème par défaut peut être personnalisé, mais tout le monde obtient à peu près le même design. Je m'ennuie du mien depuis un moment. J'ai donc cherché un outil proposant plusieurs thèmes et permettant de construire facilement le sien.

_Ne me faites pas dire ce que je n'ai pas dit : on peut personnaliser Docusaurus grâce à une technique appelée [Swizzling](https://docusaurus.io/docs/swizzling), mais c'est risqué. On peut remplacer les composants de mise en page par sa propre implémentation. Comme ces composants peuvent avoir des breaking changes (props, renommage, découpage, etc.), il faut vérifier et potentiellement corriger manuellement chaque composant de mise en page personnalisé. Ain't nobody got time for that !_

Pourquoi Zola alors ? Je ne vais pas vous mentir, je suis dans le train du hype Rust 🦀 (Rust mentionné d'ailleurs). Un moteur Rust était une exigence secrète pour ce blog. Pas besoin de gérer `node`, `node_modules` et les dépendances. Une solution simple, directe, plusieurs thèmes, tout en un. C'est exactement ce qu'il me faut.

## La mise en place du blog

Pas vraiment un guide ni un tutoriel, simplement la façon dont j'ai configuré Zola et l'ai mis en route.

### Installer Zola sur Linux

Voici comment je l'ai installé sur ParrotOS (un fork Debian/Ubuntu)

```sh
# Récupérer la dernière release depuis https://github.com/getzola/zola/releases
wget https://github.com/getzola/zola/releases/download/v0.18.0/zola-v0.18.0-x86_64-unknown-linux-gnu.tar.gz

# Installation rapide et directe
tar xvzf zola-v0.18.0-x86_64-unknown-linux-gnu.tar.gz
sudo cp zola /usr/local/bin
```

### Démarrer

```sh
zola init myblog
```

```txt
> What is the URL of your site? (https://example.com): https://brack0.dev
> Do you want to enable Sass compilation? [Y/n]: Y
> Do you want to enable syntax highlighting? [y/N]: Y
> Do you want to build a search index of the content? [y/N]: N
```

### Importer un thème sympa

```sh
git submodule add https://github.com/pawroman/zola-theme-terminimal.git themes/terminimal
```

```toml
# https://github.com/pawroman/zola-theme-terminimal
theme = "terminimal"
```

### Ajustements

Un effet de bord important lors de la définition de l'URL de production pendant `zola init` : la `base_url` est définie dans la configuration. Tous les liens sont alors construits sur cette `base_url`. Ce n'est pas ce qu'on veut avec plusieurs environnements et plusieurs URLs/domaines. Je suis revenu à `base_url = "/"` dans la config pour avoir des liens absolus sans supposer de domaine. En revanche, des URLs absolues sont nécessaires pour certaines balises meta, comme canonical et alternates. J'ai créé une valeur supplémentaire dans la config : `site_url = "https://brack0.dev"` pour construire des URLs absolues.

```txt
> What is the URL of your site? (https://example.com): https://brack0.dev
  ➡️ Cela produira ```base_url = "https://brack0.dev"``` dans config.toml
```

Ma commande de lancement pour le développement, étant donné que je travaille sur un serveur distant (serveur de dev Linux sur LAN).

```sh
# Ajouter base-url="/" car base-url vaut "http://127.0.0.1:1111" avec le serveur de dev
zola serve --base-url /
```

## Et maintenant ?

### Style / Design

J'ai intégré le thème Terminimal directement dans le code du projet, ce qui me permet de modifier ce qui ne me convient pas. Vous pouvez voir ci-dessous du CSS pour les titres. Les tailles de police sont trop proches les unes des autres et on ne les distingue pas très bien. Quoi qu'il en soit, j'ai effectué quelques mises à jour du design pour correspondre à mes attentes (visuel, accessibilité, etc.).

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

### A11Y (Accessibilité)

Il y avait plusieurs problèmes à corriger dans le thème, comme plusieurs H1. L'accessibilité est plus simple pour un blog car on a beaucoup de contenu textuel structuré et peu d'éléments complexes comme des menus déroulants, modales, carrousels, etc. Une fois les couleurs et les contrastes mis à jour, j'ai utilisé des outils ([WAVE](https://wave.webaim.org/extension/) et [AXE](https://www.deque.com/get-started-axe-devtools-browser-extension/)) pour détecter et corriger les problèmes restants.

### Migrer le contenu de l'ancien blog

En dehors de quelques détails, c'était assez facile. En gros, ça se passe comme ça : copier les fichiers [MDX](https://mdxjs.com/), mettre à jour le front matter (l'en-tête Markdown avec des métadonnées), remplacer les composants React par des [shortcodes](https://www.getzola.org/documentation/content/shortcodes/) Zola, peaufiner et voilà.

J'ai aussi créé des shortcodes pour les [admonitions](https://docusaurus.io/docs/markdown-features/admonitions) et les blocs de code. Les admonitions n'existent pas en Markdown natif, et les blocs de code ne permettent pas d'afficher un titre (ce qui est vraiment utile à mon sens).

Un comportement sympa de Zola : toutes les traductions d'un fichier Markdown se trouvent à côté de l'original (en anglais pour moi). Avec Docusaurus, les articles originaux étaient dans `/blog` et les traductions cachées dans `/i18n/[locale]/docusaurus-plugin-content-blog`. Il est aussi plus pratique de configurer deux contenus séparés (articles et épisodes de podcast) avec le SEO et le RSS.

## Conclusion

Et voilà ! Si vous lisez ceci, vous êtes sur mon nouveau blog généré par Zola. J'espère qu'il vous plaira. Aucun JavaScript inclus, construit avec Rust (encore une mention de Rust, allez !) et blazingly fast.

Adieu Nebulon. So Long, and Thanks for All the Fish 👋.
