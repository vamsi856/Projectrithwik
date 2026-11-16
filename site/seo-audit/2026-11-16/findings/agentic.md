# Agent readiness: rithwikbirdfeeds.com (2026-11-16)
Score 88/100 (proportionate to a static B2B brochure site).

## Evidence
- Lighthouse Agentic Browsing: unavailable. PSI returned HTTP 429 (daily quota, no API key) for mobile and desktop. No X/N reported.
- Agent-UX heuristic: 100, complete (separate from Lighthouse). Chromium ran without its sandbox (container runs as root), known to the orchestrator. 0 unnamed interactive nodes, 0 inputs without label, 0 div-onclick widgets. Pre-fetched JSON accessibility_tree key was null; the check's own render was used.
- Server rendering: pass, 4,621 words without JS.
- Contact actions are real links: tel: (15), wa.me (70), mailto: (10) on each view, with text like "Call 92455 55556".
- robots.txt: pass. `*` plus 10 named AI groups (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended), all Allow, Content-Signal search=yes, ai-input=yes, ai-train=yes.
- llms.txt: 200, 8,696 bytes, Lighthouse rules pass. Only info notes (list items without links, repeated home link).
- 404 handling correct (no catch-all 200).
- Markdown delivery: none (text/html, no Vary: Accept, /index.md 404). Opportunity only.
- /.well-known api-catalog, oauth-*, ai-catalog.json, agent-card.json, ucp: all 404. Not applicable.
- WebMCP: no entry point, 0 registerTool, 5 forms unannotated. Draft proposal, opportunity only.

## Access policy
- Training: allowed (ai-train=yes, explicit groups).
- Search: allowed.
- User-triggered agents: allowed (ChatGPT-User, Claude-User, Perplexity-User). Claude-User honours robots; Perplexity-User and Google-Agent generally ignore it.
Standards (Content-Signal, WebMCP, ai-catalog.json: drafts/proposals; facts checked 2026-09-23 per the tool).

## Findings
- Low (class C/decision): ai-train=yes is a business choice. Confirm the owner wants grain-trade copy used for training. Change in site/src/pages/robots.txt.ts if not (class A).
- Low (A): the 5 forms (enquiry, plus 3 method=dialog) have no WebMCP annotation. Not worth doing for a wholesaler; phone/WhatsApp are the real channel and already machine-readable.
- Low (A, optional): llms.txt contact lines have no links; could add `[WhatsApp](https://wa.me/919245555556)` and `[Catalogue](https://rithwikbirdfeeds.com/Rithwik-Catalogue.pdf)` under a link-bearing H2 in site/src/pages/llms.txt.ts. Info level only.
- Not applicable: Markdown delivery, ai-catalog.json, api-catalog, OAuth, agent-card, UCP, Web Bot Auth, llms-full.txt. No ranking or citation effect promised.
