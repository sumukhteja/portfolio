# Case studies

Two problems worth writing down. Each one: what was wrong, what I tried,
what broke, and what shipped.

---

## Keeping every student's photos private to them

**Problem.** All Kind Studio needed a web app where students enrol in pottery
classes, track their progress and upload photos of their work. Studio staff
needed to see everything; students needed to see only their own.

**What I tried.** One S3 bucket behind the API, with the backend checking who
was asking before handing a file back.

**What broke.** That puts the whole privacy guarantee in application code —
every new endpoint is another place to get the check wrong, and a signed URL
that leaks is valid for anyone who has it. Authorisation belonged lower down
than the handler.

**What I shipped.** A serverless app on Cognito, Lambda, API Gateway, S3 and
CloudFront, with the whole stack defined as CloudFormation so environments
are reproducible rather than clicked together. Google OAuth sign-in sits
alongside email sign-up through a Cognito User Pool, so students get one-click
login; admin roles and per-user prefixes scope S3 access to the identity
itself, so a student's photos and data stay private to their account without
the handler having to remember. On top of that, a community feed for sharing
work and commenting, with S3-backed media and moderation tools for the studio.

---

## Purchase orders nobody should have to retype

**Problem.** Flyberry Gourmet received purchase orders as PDFs, and the line
items, pricing, delivery locations and HSN codes were being typed out by hand
before anything downstream could happen.

**What I tried.** Reading the PDF's text layer and splitting it on whitespace.

**What broke.** Text order is not table structure. Supplier layouts differ,
column positions drift, wrapped descriptions collapse into their neighbours,
and codes merge with the number sitting beside them. The extraction has to
understand position, not reading order.

**What I shipped.** A full-stack document extraction tool that pulls line
items, pricing, delivery locations and HSN codes straight out of PO PDFs,
replacing the manual step entirely. The frontend runs on Cloudflare Pages and
the backend on Lambda behind API Gateway, with CORS policies and
environment-based API URL management so the same build points at the right
backend per environment.
