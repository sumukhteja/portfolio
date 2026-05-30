const projects = [
  {
    title: "01 / Serverless Deploy Automation",
    meta: "AWS Infrastructure",
    desc: "Script-driven serverless deployment pipeline using Python and boto3, provisioning AWS Lambda, DynamoDB, API Gateway v2, S3, Cognito and IAM with auto-incrementing environment naming. JWT auth via Cognito with RS256 token verification using the JWKS endpoint.",
    tags: ["Python", "boto3", "AWS Lambda", "DynamoDB", "API Gateway", "Cognito", "IAM", "S3"]
  },
  {
    title: "02 / ISRO Interactive Documentary",
    meta: "Data Visualisation",
    desc: "Interactive web documentary on ISRO's history with a state-driven multi-stage flow, custom HTML5 video player, and timer-based narration. Interactive map of India via D3.js and TopoJSON with GSAP-driven animated transitions.",
    tags: ["D3.js", "TopoJSON", "GSAP", "JavaScript", "CSS Keyframes"]
  },
  {
    title: "03 / Knowledge Search — Rust + WASM",
    meta: "Search Engine",
    desc: "Full-text search engine in Rust using Axum + Tokio for async REST APIs and Tantivy for indexing, with Rayon-powered concurrent indexing. Compiled to WebAssembly on Cloudflare Workers for zero cold starts and global deployment.",
    tags: ["Rust", "Axum", "Tokio", "Tantivy", "WebAssembly", "Cloudflare Workers"]
  },
  {
    title: "04 / UPSC RAG",
    meta: "AI / Local LLM",
    desc: "Fully local RAG pipeline to answer UPSC queries from custom PDF material. PyMuPDF for parsing, Sentence Transformers for embeddings, FAISS for vector search, and TinyLlama via llama.cpp for offline inference. Multi-turn Streamlit interface.",
    tags: ["Python", "FAISS", "Sentence Transformers", "llama.cpp", "PyMuPDF", "Streamlit"]
  },
  {
    title: "05 / Frontend Showcase",
    meta: "Interactive Web",
    desc: "A collection of interactive front-end experiences and data visualisations built across the year — choropleths, knowledge graph renderers, scrollytelling pieces and custom relief-map rendering using Leaflet, Mapbox and Cesium.",
    tags: ["JavaScript", "Leaflet", "Mapbox", "Cesium", "D3.js", "GSAP"]
  }
];

export default function Projects() {
  return (
    <section id="projects">
      <div className="container" data-aos="fade-up">
        <span className="section-label">Works</span>
        <h2 className="title-large" style={{marginBottom: '5rem'}}>Projects</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '4rem'
        }}>
          {projects.map((proj, idx) => (
            <div key={idx} className="card-minimal" style={{paddingBottom: '2rem'}}>
              <h3 style={{fontSize: '2rem', marginBottom: '0.5rem'}}>{proj.title}</h3>
              <p style={{fontSize: '0.8rem', opacity: 0.5, marginBottom: '1.5rem', fontFamily: 'var(--font-mono)'}}>{proj.meta}</p>
              <p style={{marginBottom: '1.5rem', minHeight: '60px'}}>{proj.desc}</p>
              <div>
                {proj.tags.map((tag, i) => (
                  <span key={i} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
