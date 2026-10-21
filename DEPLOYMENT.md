# AIM Smart Solutions Pharmaceutical Application

A React/Vite demonstration app with pharmaceutical market analysis, import and pricing simulators, and an OpenRouter-powered strategy assistant.

## Deployment plan
- Frontend: GitHub Pages at https://aidemolab.github.io/aim-pharmaceutical-ai-demo/
- Backend: Supabase Edge Function `pharma-openrouter-chat` in the dedicated AIM Pharmaceutical AI Demo Supabase project.
- OpenRouter model: `deepseek/deepseek-v4.1-flash-1017`.
- Secret: `OPENROUTER_API_KEY`, stored in Supabase Edge Function Secrets. Never put it in GitHub, browser code or environment variables prefixed with VITE_.

## Before public launch
1. Set the secret securely in the Supabase dashboard.
2. Deploy the function from `supabase/functions/pharma-openrouter-chat/index.ts`.
3. IMPORTANT: public access to a paid API proxy needs effective server-side rate limits / abuse controls before deployment; checking the Origin header alone does not prevent abuse.
4. Run `npm run lint` and `npx vite build`; verify interactive screens and calculations.
5. Enable GitHub Pages via Settings → Pages → Source: GitHub Actions. Merge the branch only after review.
6. Review illustrative sample data labelling, security and privacy before publishing.

The original AI Studio source remains on main until deployment changes are reviewed.
