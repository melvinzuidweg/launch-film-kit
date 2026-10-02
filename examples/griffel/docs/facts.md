# Facts file (only source for on-screen claims)

**Source:** griffel-app `reports/launch-video-2026-10-01/01-brand-brain.md` §4, the code checks in report 06, and the founder's approval on 2026-10-01.

| ID | Claim on screen | Status | Source |
|---|---|---|---|
| F1 | "De AI-notulist die doorvraagt." | SAFE, official slogan | website, store, e-mail footer |
| F2 | Griffel asks short questions about what was unclear (names, deadlines, amounts, who owns an action); you answer with a tap; skipping is allowed. Lines: "Iets onduidelijk? Griffel vraagt het eerst aan jou.", "Griffel raadt niet. Griffel vraagt." | SAFE | homepage.ts, listing-nl.md, nl.ts |
| F3 | "Echte namen in je notulen. Geen Spreker 1." Listen to a clip per speaker; you confirm or type the name. | SAFE. Suggestions are conditional, so the video shows typing. | homepage FAQ, speaker-naming.tsx, generateSpeakerPrompts.ts |
| F4 | Notulen with decisions and action items, e-mailed to you and the attendees you choose. "Besluiten en actiepunten in de inbox van wie jij kiest." | SAFE | homepage.ts, listing-nl.md |
| F5 | "Verstuurd is verwijderd." Recording, transcript, questions and notulen are wiped within seconds after sending. | SAFE | privacy-data-flow.md |
| F6 | "Binnen enkele seconden gewist." | Approved by the founder on 2026-10-01 (about a 3 s worker tick in the normal flow) | privacy-data-flow.md |
| F7 | "Voeg een agenda of offerte toe. Griffel gebruikt die voor namen en bedragen." | SAFE (context upload) | nl.ts meeting.context.*, approved 2026-10-01 |
| F8 | "Gratis: 3 meetings per maand." | SAFE | homepage.ts, listing-nl.md |
| F9 | "Gemaakt in Nederland. Verwerkt in de EU." | SAFE | company.ts, listing-nl.md |
| F10 | griffel.ai, plus the App Store and Google Play badges | SAFE | site.ts |
| F11 | The push copy and the UI strings shown in the app | SAFE, verbatim | nl.ts, workflowPushCopy.ts |

**Do not use:**
- foutloos / foutloze, enige, uniek, beste
- "alles gewist" / "bewaart niets"
- Europese AI, geen Amerikaanse cloud, AVG-compliant
- "geen account nodig"
- any time claim (30 sec, binnen minuten)
- ratings, user counts, testimonials
- competitor names or comparisons
- prices other than the free tier
