# Swiss Grades

A Swiss grade calculator built with SvelteKit.

**Live:** [grades.sulej.ch](https://grades.sulej.ch)

## Features

- **Grade Calculator:** convert points to a Swiss grade using the formula `(Points × 5 / Max points) + 1`
- **Grade Average:** calculate a weighted average across multiple subjects with optional sub-grades and drag-to-reorder
- **Required Grade:** find out what grade you need in future exams to reach a target average
- Configurable rounding (2 decimal, 1 decimal, 0.5, 0.25)
- Available in German, English, French, and Italian
- Light / dark theme
- Fully responsive, mobile-friendly UI
- Keyboard shortcuts (`Ctrl+Enter` to add, `Ctrl+Delete` to remove)

## Docker

A pre-built multi-platform image is available on the GitHub Container Registry:

```sh
docker pull ghcr.io/arlind-dev/swiss-grades:latest
```

Or use the provided Compose file:

```sh
docker compose up -d
```

The container serves the app via nginx on port `8080`.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
