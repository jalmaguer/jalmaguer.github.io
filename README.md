# jalmaguer.github.io

Source for [josealmaguer.com](https://josealmaguer.com), served by GitHub Pages from the `master` branch.
There is no build step: anything pushed to `master` goes live.

## Layout

- `index.html`: home page (a placeholder for now)
- `assets/`: files shared between pages, such as `site.css`
- `<article-name>/`: one folder per article, with its `index.html`, code and images
- `snake/`: the snake game
- `CNAME`: the custom domain (keep this)
- `.nojekyll`: tells GitHub Pages to skip Jekyll processing

## Conventions

- Article folders go at the top level, named in lowercase with hyphens. The folder name is the web address.
- If an article moves, leave a redirect page at its old address.
- Link to shared files with paths that start with `/`, such as `/assets/site.css`. Use relative paths for an article's own files.
- Add shared JavaScript in `assets/js/` only when two articles need the same code.
- Write drafts on a separate branch. The repository is public, so pushed branches are visible.

## Local preview

From the repository folder, run:

```bash
python3 -m http.server 8001 --bind 127.0.0.1
```

Then open <http://localhost:8001>.
