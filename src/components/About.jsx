export default function About() {
  return (
    <section id="about">
      <div className="container">
        <span className="section-label">Identity</span>
        <h2 className="title-large">Backend & Cloud Engineer</h2>
        <div style={{ marginTop: '3rem', maxWidth: '800px' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            I am Sumukh Teja Vanamala. Last year I built close to 200 projects — mostly backend, cloud and AI — end to end, while building my own product at The Explorer.
          </p>
          <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>
            RAG pipelines and local LLMs, a custom database engine, scraping and automation pipelines, a stack of data visualisations, a serverless AWS deployment pipeline, a fully offline RAG setup, and a search engine in Rust compiled to WebAssembly.
          </p>
          <p style={{ opacity: 0.7 }}>
            Started in mechanical engineering, moved into software at Accenture (C#/.NET, Oracle SQL, VBA), and gone deeper into backend and cloud since. Currently wrapping up AWS Solutions Architect Associate and Terraform Associate. Based in Hyderabad.
          </p>
        </div>
      </div>
    </section>
  );
}
