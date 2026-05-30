const skillGroups = [
  {
    category: "Languages",
    skills: [
      { name: "Python", detail: "FastAPI, Flask, pandas, PyMuPDF, boto3" },
      { name: "JavaScript", detail: "D3.js, GSAP, Leaflet, Mapbox, Cesium" },
      { name: "Rust", detail: "Axum, Tokio, Tantivy, Rayon, WebAssembly" },
      { name: "Go", detail: "Concurrency, goroutines, standard library" },
      { name: "C", detail: "Low-level systems, memory management" },
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
    category: "Cloud & Infrastructure",
    skills: [
      { name: "AWS", detail: "Lambda, DynamoDB, API Gateway, S3, Cognito, IAM, STS" },
      { name: "Cloudflare", detail: "Workers, Pages, WASM deployment, zero cold starts" },
      { name: "Docker", detail: "Containerization, gunicorn, production serving" },
      { name: "Railway", detail: "Backend deployment, environment config" },
      { name: "Protocol Buffers", detail: "gRPC-style service on FastAPI" },
      { name: "JWT / Auth", detail: "RS256, JWKS, Cognito token verification" }
    ]
  },
  {
    category: "Frontend & Visualisation",
    skills: [
      { name: "React", detail: "Hooks, component architecture" },
      { name: "D3.js", detail: "Choropleths, force graphs, TopoJSON maps" },
      { name: "GSAP", detail: "Scroll-driven animation, transitions" },
      { name: "Leaflet / Mapbox", detail: "Interactive geospatial maps" },
      { name: "Cesium", detail: "3D globe and terrain rendering" },
      { name: "Electron", detail: "Desktop app packaging" },
      { name: "Capacitor", detail: "Mobile deployment from web stack" }
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
                        fontSize: '1.2rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '8px 16px',
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
