# /brag

A directory of [/brag](https://bragdocs.com) docs. Add yours with a PR.

## How to add your /brag

1. **Fork** this repo
2. Create a JSON file in `data/` named `your-name.json` (kebab-case — the filename becomes your display name):

```json
{
  "location": "City, Country",
  "link": "https://yoursite.com/brag",
  "description": "A short 1-2 sentence description about you."
}
```

3. Submit a **pull request**

That's it. The site rebuilds automatically when your PR is merged. Your name is derived from the filename (`your-name.json` → "Your Name"). You can also include a `"name"` field to override it.

## Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | | Your display name (defaults to filename if omitted) |
| `link` | ✅ | URL to your /brag document |
| `location` | | Where you're based |
| `description` | | One-liner about you or your work |
| `image-url` | | Avatar image shown next to your entry (optional) |

## Tech

Built with [Astro](https://astro.build) + [Tailwind CSS v4](https://tailwindcss.com). The build script
(`scripts/build-data.cjs`) combines all JSON files in `data/` into `public/data.json` at build
time (deriving names from filenames), then Astro generates the static site. Deployed on Cloudflare Pages.

### Local development

```bash
npm install
npm run dev        # starts dev server
npm run build      # production build → dist/
```
