# /brag

A directory of [/brag](https://bragdocs.com) docs. Add yours with a PR.

## How to add your /brag

1. **Fork** this repo
2. Create a JSON file in `src/data/entries/` named `yourname.json`:

```json
{
  "name": "Your Name",
  "location": "City, Country",
  "link": "https://yoursite.com/brag",
  "description": "A short 1-2 sentence description about you."
}
```

3. Submit a **pull request**

That's it. The site rebuilds automatically when your PR is merged.

## Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ | Your name or handle |
| `link` | ✅ | URL to your /brag document |
| `location` | | Where you're based |
| `description` | | One-liner about you or your work |

## Tech

Built with [Astro](https://astro.build) + [Tailwind CSS v4](https://tailwindcss.com). The build script
(`scripts/build-data.cjs`) combines all JSON files in `src/data/entries/` into `public/data.json` at build
time, then Astro generates the static site. Deployed on Cloudflare Pages.

### Local development

```bash
npm install
npm run dev        # starts dev server
npm run build      # production build → dist/
```
