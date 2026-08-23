# Meridian — deploying it

The whole app is `index.html`. No build step, no dependencies, no server code.
It needs to be served over `http://` or `https://` for two things to work:

- the worldwide city lookup (Open-Meteo geocoding)
- the street map layer (OpenStreetMap via Overpass)

Opened straight from storage as a `file://` page, both are blocked by the
browser and the app falls back to its built-in list of 274 cities.

---

## Vercel, from a computer

```bash
cd meridian-deploy
npx vercel          # first run asks you to log in, then previews
npx vercel --prod   # promotes it to the live URL
```

Answer the setup prompts with the defaults. When it asks for a framework,
choose **Other**. There is nothing to build, so leave the build command empty
and set the output directory to `.` if prompted.

## Vercel, from a phone or without the CLI

1. Put `index.html` and `vercel.json` in a new GitHub repository.
2. At vercel.com, **Add New → Project**, import that repository.
3. Framework preset **Other**, no build command, output directory `.`.
4. Deploy. Every later push redeploys automatically.

## Fastest alternative if you just want a URL now

Netlify Drop — netlify.com/drop — takes a dropped folder or a `.zip`
straight in the browser, including on mobile, and returns a live URL with no
account required for the first deploy. Upload `meridian-deploy.zip` as-is.

GitHub Pages also works: push the folder to a repo, then
**Settings → Pages → Deploy from a branch → root**.

---

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The entire application |
| `vercel.json` | Clean URLs, and stops the HTML being cached so updates show immediately |

## Custom domain

On Vercel: **Project → Settings → Domains → Add**. Point a CNAME at
`cname.vercel-dns.com`, or an A record at `76.76.21.21` for an apex domain.
