# Venator

![GitHub Actions deploy badge](https://img.shields.io/github/actions/workflow/status/Brack0/blog/deploy.yml?branch=main&logo=github&labelColor=black)
![Zola version badge](https://img.shields.io/badge/Zola-0.18.0-orange?logo=rust&labelColor=black)
![MIT License badge](https://img.shields.io/github/license/Brack0/blog?labelColor=black)
[![Mozilla Observatory badge](https://img.shields.io/mozilla-observatory/grade/brack0.dev?publish&logo=mozilla&labelColor=black)](https://observatory.mozilla.org/analyze/brack0.dev)

Venator is a static website for a personal blog. It's based on [Zola](https://www.getzola.org/), a static site generator built with Rust. You can find more context in the blog article [Welcome Zola !](content/articles/2024-03-15-welcome-zola.md).

## Getting started

Install Zola : <https://www.getzola.org/documentation/getting-started/installation/>

### Launch dev mode

```sh
zola serve -u /
```

#### Trivia

We use `-u /`, which stands for `base_url = "/"`, in dev mode as we don't default value (`127.0.0.1:1111`). See `site_url` in `config.toml`.

### Build the app

```sh
zola build
```

## Integration

### GitHub Actions (GitHub Pages)

A CI/CD pipeline is configured via GitHub Actions in [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml). On every push to the `main` branch, it:

1. Builds the site with `getzola/github-pages@v1` (Zola `0.18.0`) and uploads a Pages artifact
2. Deploys the artifact via `actions/deploy-pages`

Make sure GitHub Pages is configured to use **GitHub Actions** as the source in the repository settings.

## Roadmap

**Main goal: Replace previous blog (<https://gitlab.com/Brack0/nebulon>)**

Tasks are available in [TODO.md](./TODO.md).

## Contributing

See [CONTRIBUTING](./CONTRIBUTING.md).

## License

MIT License. Check [LICENSE](./LICENSE.md) for more details.
