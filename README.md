# SKYFORGE

SKYFORGE is a cloud company-profile and interactive infrastructure prototype built with HTML, CSS, vanilla JavaScript, CesiumJS, and a small dependency-free Node.js backend for project consultation submissions.

## Run the full website

Node.js 18+ is recommended.

```bash
npm start
```

Then open `http://127.0.0.1:8080`.

The Node server serves every static route and enables the real `POST /api/project-brief` endpoint. If you only open `index.html` directly or use a generic static server, the website still renders, but the Project Consultation form will correctly report that its backend is unavailable instead of pretending the submission was sent.

To use a different address or port:

```bash
HOST=0.0.0.0 PORT=3000 npm start
```

## Homepage highlights

- About SKYFORGE: company explanation, vision, mission, and product purpose.
- Why Choose SKYFORGE: modern infrastructure, scalable solutions, developer-friendly workflows, and flexible integration.
- Interactive products and solution architecture.
- Expanded dashboard preview with demo CPU, RAM, storage, project health, and server monitoring.
- Animated deployment pipeline: Build → Test → Deploy → Running.
- Security & Infrastructure: data protection, network security, access management, monitoring, backup, and recovery.
- Our Projects prototype showcase.
- Founder/team profile section with an explicit placeholder profile ready to be replaced with verified founder information.
- Simulated homepage system status for API, Storage, Database, and Console.
- Project Consultation form connected to the Node.js backend.
- CesiumJS server-region globe for Jakarta, Singapore, and Tokyo.

All console metrics, region latency, system status, pricing, and deployment progress are explicitly demo/simulated values unless replaced with real infrastructure data.

## Project consultation backend

`POST /api/project-brief` accepts JSON fields for name, email, company, service type, plan, preferred region, and project description. Accepted submissions are appended as one JSON object per line to:

```text
data/project-briefs.jsonl
```

The backend includes field validation, request-size limits, a honeypot field, basic in-memory rate limiting, safe static path handling, and security response headers. There is intentionally no public endpoint for reading submissions.

Treat `data/project-briefs.jsonl` as private contact/project data. It is ignored by Git by default. For a real production deployment, store submissions in a managed database or CRM and add authentication/authorization for any internal review interface.

## Main routes

- Homepage: `/`
- Products: `/compute/`, `/storage/`, `/network/`, `/database/`
- Docs: `/docs/`, `/docs/compute/`, `/docs/storage/`, `/docs/networking/`, `/docs/api/`, `/docs/cli/`
- Tools: `/calculator/`, `/status/`
- Information: `/contact/`, `/security/`, `/privacy/`, `/terms/`, `/changelog/`
- Demo account flow: `login.html`, `app.html`

## Code map

| File | Responsibility |
| --- | --- |
| `index.html` | Homepage structure and company-profile sections. |
| `styles.css`, `skyforge.css` | Base design system and SKYFORGE layout. |
| `company-upgrade.css` | About, advantages, security, projects, team, pipeline, status, and monitoring UI. |
| `script.js` | Language/theme, homepage console, pricing, deployment simulation, dialogs, and backend project brief submission. |
| `company-upgrade.js` | Pipeline stage animation, simulated live metrics/status, and new-section reveals. |
| `server.js` | Static server and project consultation API. |
| `pointer.js`, `motion.js` | Pointer and motion/reveal interactions. |
| `checkout.js` | Illustrative checkout flow. |
| `cloud.js`, `cloud-extras.js` | Demo cloud workspace/session resources. |
| `public.js` | Calculator, public status utilities, docs helpers, and network map. |
| `server-globe.js` | CesiumJS demo region globe. |

## Checks

Run syntax checks with:

```bash
npm run check
```

The Project Consultation endpoint has been tested end-to-end with a local Node server: a valid POST returns HTTP 201 and persists a JSONL record. Test records are removed from the distributed archive.

Before a production launch, also test the website on desktop/mobile browsers and replace all placeholder/demo company data, founder information, infrastructure claims, addresses, prices, and region availability with verified information.

## Cesium globe

The homepage globe uses CesiumJS 1.121 from the official CDN and Natural Earth imagery. It does not require a Cesium ion token. The Jakarta, Singapore, and Tokyo points are city-level demo reference locations, not server facility addresses, and their shown latency is not live network measurement.
