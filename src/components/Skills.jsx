const skillGroups = [
  {
    category: "Languages",
    skills: [
      { name: "Python", detail: "Flask, pandas, PyMuPDF, boto3" },
      { name: "C# / .NET", detail: "WinForms, .NET Framework, ASP.NET" },
      { name: "SQL", detail: "Oracle SQL, PL/SQL, complex joins, tuning" },
      { name: "LaTeX", detail: "Programmatic document generation" }
    ]
  },
  {
    category: "AI & ML",
    skills: [
      { name: "RAG Pipelines", detail: "FAISS vector search, chunking, retrieval" },
      { name: "Ollama / llama.cpp", detail: "Local LLM inference, TinyLlama, offline setup" },
      { name: "Sentence Transformers", detail: "all-MiniLM-L6-v2, embeddings" },
      { name: "Neo4j", detail: "Knowledge graphs, Cypher, relationship modeling" },
      { name: "OCR", detail: "PDF and scan text extraction, PyMuPDF" },
      { name: "TTS / STT", detail: "Audio generation, live voice agents, low-latency" },
      { name: "MCP Servers", detail: "Custom tool exposure to LLM models" }
    ]
  },
  {
    category: "Cloud",
    skills: [
      { name: "AWS", detail: "Lambda, API Gateway, DynamoDB, S3, Cognito, SQS, SNS, IAM" },
      { name: "Terraform", detail: "Infrastructure as code" },
      { name: "Azure", detail: "AI Fundamentals, cloud services" },
      { name: "Cloudflare", detail: "Workers, Pages" },
      { name: "Netlify", detail: "Static site and app deployment" },
      { name: "Railway", detail: "Backend deployment, environment config" }
    ]
  },
  {
    category: "Backend",
    skills: [
      { name: "Node.js", detail: "REST APIs, server-side JavaScript" },
      { name: "Flask", detail: "REST APIs, PDF/table extraction pipelines" }
    ]
  }
];

export default function Skills() {
  return (
    <section id="skills">
      <div className="container" data-aos="fade-up">
        <span className="section-label">Craft</span>
        <h2 className="title-large" style={{marginBottom: '5rem'}}>Tech Stack</h2>
        <div className="grid" style={{gap: '5rem'}}>
          {skillGroups.map((group, idx) => (
            <div key={idx} className="skill-category">
              <h3 style={{
                fontSize: '2rem',
                marginBottom: '2rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '1rem',
                opacity: 0.9
              }}>
                {group.category}
              </h3>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
                {group.skills.map((skill, i) => (
                  <div key={i} className="skill-badge-wrapper" style={{position: 'relative'}}>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '6px 11px',
                        border: '1px solid var(--border)',
                        display: 'inline-block',
                        cursor: 'help'
                      }}
                      className="skill-badge"
                    >
                      {skill.name}
                    </span>
                    <div className="skill-tooltip">
                      {skill.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
