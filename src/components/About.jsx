export default function About() {
  return (
    <section id="about">
      <div className="container">
        <span className="section-label">Identity</span>
        <h2 className="title-large">Backend & Cloud Engineer</h2>
        <div style={{ marginTop: '3rem', maxWidth: '800px' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            I am Sumukh Teja Vanamala, a backend and cloud engineer working across backend, cloud and AI, end to end, as Senior Developer at Girgit Inc.
          </p>
          <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>
            Event-driven serverless AWS infrastructure (Lambda, API Gateway, DynamoDB, S3, Cognito, SQS, SNS), RAG pipelines over large document corpora, scraping and automation pipelines, and a fully offline local RAG setup.
          </p>
          <p style={{ opacity: 0.7 }}>
            Started in mechanical engineering, moved into software at Accenture (C#/.NET, Oracle SQL, VBA), and gone deeper into backend and cloud since. AWS Certified Solutions Architect – Associate and HashiCorp Terraform Associate certified; currently working through Stanford's Machine Learning Specialization. Based in Hyderabad.
          </p>
        </div>
      </div>
    </section>
  );
}
