export interface Project {
  name: string;
  blurb: string;
  stack: string[];
  when: string;
}

export const projects: Project[] = [
  {
    name: 'Serverless Deploy Automation',
    blurb:
      'Script-driven pipeline that provisions and wires AWS resources with ' +
      'auto-incrementing environment naming. Cognito JWT auth with RS256/JWKS ' +
      'verification and local key caching. Teardown script deletes all resources ' +
      'in reverse dependency order.',
    stack: ['Python', 'boto3', 'AWS Lambda', 'DynamoDB', 'API Gateway', 'Cognito'],
    when: 'Jan – Feb 2026',
  },
  {
    name: 'NEET RAG',
    blurb:
      'Fully local retrieval-augmented generation pipeline answering queries from ' +
      'custom PDF material via FAISS vector search. Offline inference with TinyLlama ' +
      'and llama.cpp, multi-turn Streamlit UI feeding conversation history into the ' +
      'prompt for grounded answers.',
    stack: ['Python', 'FAISS', 'Sentence Transformers', 'llama.cpp', 'PyMuPDF', 'Streamlit'],
    when: 'Aug 2025',
  },
];

export default projects;
