const skillGroups = [
  {
    category: "Languages",
    skills: ["Python", "C# / .NET", "SQL", "LaTeX"]
  },
  {
    category: "AI & ML",
    skills: ["RAG Pipelines", "Ollama / llama.cpp", "Sentence Transformers", "Neo4j", "OCR", "TTS / STT", "MCP Servers"]
  },
  {
    category: "Cloud",
    skills: ["AWS", "Terraform", "Azure", "Cloudflare", "Netlify", "Railway"]
  },
  {
    category: "Backend",
    skills: ["Node.js", "Flask"]
  }
];

export default function Skills() {
  return (
    <section id="skills">
      <div className="container" data-aos="fade-up">
        <span className="section-label">Craft</span>
        <h2 className="title-large" style={{marginBottom: '3rem'}}>Tech Stack</h2>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px'}}>
          {skillGroups.map((group, idx) => (
            <p key={idx} style={{fontSize: '1.1rem', lineHeight: '1.6', margin: 0}}>
              <span style={{fontWeight: '600'}}>{group.category}: </span>
              <span style={{opacity: 0.7}}>{group.skills.join(', ')}</span>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
