const projects = [
  {
    title: "01 / Serverless Deploy Automation",
    meta: "AWS Infrastructure",
    points: [
      "Script-driven serverless deployment pipeline using Python and boto3, provisioning AWS Lambda, DynamoDB, API Gateway v2, S3, Cognito and IAM with auto-incrementing environment naming.",
      "JWT auth via Cognito with RS256 token verification using the JWKS endpoint, plus a full teardown script that deletes all provisioned resources in reverse dependency order."
    ],
    tags: ["Python", "boto3", "AWS Lambda", "DynamoDB", "API Gateway", "Cognito", "IAM", "S3"]
  },
  {
    title: "02 / NEET RAG",
    meta: "AI / Local LLM",
    points: [
      "Fully local RAG pipeline that answers NEET queries from custom PDF material, using PyMuPDF for parsing, Sentence Transformers for embeddings and FAISS for vector search.",
      "Offline inference via TinyLlama and llama.cpp, with a multi-turn Streamlit interface that feeds conversation history back into the prompt for grounded answers."
    ],
    tags: ["Python", "FAISS", "Sentence Transformers", "llama.cpp", "PyMuPDF", "Streamlit"]
  },
  {
    title: "03 / Frontend Showcase",
    meta: "Interactive Web",
    points: [
      "A collection of interactive front-end experiences and data visualisations built across the year, including choropleths, knowledge graph renderers and scrollytelling pieces.",
      "Custom relief-map rendering and geospatial interactivity built with Leaflet, Mapbox, Cesium, D3.js and GSAP."
    ],
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
              <ul style={{listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                {proj.points.map((point, i) => (
                  <li key={i} style={{display: 'flex', gap: '0.75rem', opacity: 0.7, lineHeight: '1.5'}}>
                    <span style={{opacity: 0.4}}>—</span>
                    {point}
                  </li>
                ))}
              </ul>
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
