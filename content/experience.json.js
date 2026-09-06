PORTFOLIO.file({
  name: 'experience.json',
  folder: 'src',
  lang: 'json',
  content: `[
  {
    "role": "Senior Developer",
    "company": "Girgit Inc",
    "type": "Full-time",
    "location": "Hyderabad",
    "start": "2023-08",
    "end": "present",
    "focus": "Python | AWS | Distributed Systems",
    "summary": "Built event-driven AWS architecture, RAG pipelines and automation infrastructure end to end.",
    "highlights": [
      "Designed and built from scratch the event-driven serverless backbone of an early-stage product on Lambda, API Gateway, DynamoDB, S3, Cognito and IAM, decoupling services with SQS queues and SNS fan-out for fault-tolerant, asynchronous processing at scale",
      "Built RAG pipelines over a large document corpus using FAISS, Neo4j knowledge graphs and local LLMs via Ollama, with OCR and MCP servers exposing custom tools to models",
      "Built content and data automation pipelines covering multi-source ingestion and scraping, and audio generation with TTS and STT, including low-latency live voice agents",
      "Drove code quality through automated testing and CI/CD on GitHub Actions, and instrumented CloudWatch metrics and structured logging for latency, error rates and throughput"
    ]
  },
  {
    "role": "Cloud Engineer — AWS, OAuth",
    "company": "All Kind Studio",
    "type": "Freelance",
    "location": "Greater Hyderabad Area · Remote",
    "start": "2026-08",
    "end": "2026-09",
    "duration": "2 mos",
    "highlights": [
      "Built and deployed a serverless web app on AWS (Cognito, Lambda, API Gateway, S3, CloudFront) to manage pottery classes, enrolments, and student progress — full infrastructure defined as code with CloudFormation",
      "Integrated Google OAuth sign-in with AWS Cognito, giving students one-click login alongside email sign-up with admin roles and per-user access to S3 buckets so photos and data stay private to each account (Cognito User Pool)",
      "Added a community feed for students to share work and comment, with S3-backed media and moderation tools for the studio team"
    ]
  },
  {
    "role": "Automation Engineer — AWS Lambda, Cloudflare Pages, Python",
    "company": "Flyberry Gourmet",
    "type": "Freelance",
    "location": "Greater Hyderabad Area · Remote",
    "start": "2025-09",
    "end": "2025-09",
    "duration": "1 mo",
    "highlights": [
      "Built a full-stack document extraction tool automating extraction of line items, pricing, delivery locations and HSN codes from PO PDFs, replacing manual data entry",
      "Deployed the frontend on Cloudflare Pages and the backend on Lambda behind API Gateway, configuring CORS policies and environment-based API URL management"
    ]
  },
  {
    "role": "Software Engineering Associate — .NET | C# | Oracle SQL | VBA",
    "company": "Accenture",
    "type": "Full-time",
    "location": "Hyderabad, Telangana, India · On-site",
    "start": "2022-01",
    "end": "2023-04",
    "duration": "1 yr 4 mos",
    "highlights": [
      "Maintained and enhanced a C#/.NET Framework WinForms desktop application supporting policy and claims workflows for a Fortune 500 specialty insurer",
      "Performed RCA on production defects across the .NET front end and Oracle data layer, resolving recurring incidents via ServiceNow, documented using Jira. Delivered changes in an Agile/Scrum model, collaborating with QA and business analysts through to UAT and release",
      "Wrote and optimized Oracle SQL queries and PL/SQL stored procedures, tuning data retrieval across large policy tables to improve performance",
      "Built Excel-based reporting and reconciliation tools using VBA macros and Power Query, automating data extraction and transformation to cut manual effort"
    ]
  }
]
`
});
