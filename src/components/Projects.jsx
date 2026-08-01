const projects = [
  {
    title: "01 / Serverless Deploy Automation",
    meta: "AWS Infrastructure",
    desc: "Script-driven serverless deployment pipeline using Python and boto3, provisioning AWS Lambda, DynamoDB, API Gateway v2, S3, Cognito and IAM with auto-incrementing environment naming. JWT auth via Cognito with RS256 token verification using the JWKS endpoint.",
    tags: ["Python", "boto3", "AWS Lambda", "DynamoDB", "API Gateway", "Cognito", "IAM", "S3"]
  },
  {
    title: "02 / NEET RAG",
    meta: "AI / Local LLM",
    desc: "Fully local RAG pipeline to answer NEET queries from custom PDF material. PyMuPDF for parsing, Sentence Transformers for embeddings, FAISS for vector search, and TinyLlama via llama.cpp for offline inference. Multi-turn Streamlit interface.",
    tags: ["Python", "FAISS", "Sentence Transformers", "llama.cpp", "PyMuPDF", "Streamlit"]
  },
  {
    title: "03 / Frontend Showcase",
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
        <div className="grid">
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
