# /brag

A directory of [/brag](https://bragdocs.com) docs. Add yours with a PR.

## How to add your /brag

1. **Fork** this repo
2. Create a JSON file in `data/entries/` named `yourname.json`:

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

Static site deployed on Cloudflare Pages. The build script combines all JSON files in `data/entries/` into `public/data.json` at build time.
