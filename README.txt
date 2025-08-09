# Established Shot — Dental Market Map (Vercel)

## Deploy (no-code-ish)
1) Create a free Vercel account.
2) Create a new project and "Import" this folder (upload or connect a Git repo).
3) In Vercel → Settings → Environment Variables, add:
   - OPENAI_API_KEY = your ChatGPT-5 key (keep private)
4) In `public/index.html`, replace `YOUR_GOOGLE_API_KEY` with your Google Maps/Places key,
   then commit/deploy (or edit via Vercel's Git repo).
5) Visit the site and test the search. The AI panel calls `/api/generate-insight`.

## Squarespace embed
Add a Code Block and paste:
<div style="width:100%;max-width:1200px;margin:auto">
  <iframe src="https://YOUR-PROJECT.vercel.app" style="width:100%;height:1000px;border:0;border-radius:16px;overflow:hidden" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
</div>

## Security
- Restrict your Google Maps key to the Vercel domain and `establishedshot.com`.
- Rotate any keys you pasted into chats.
