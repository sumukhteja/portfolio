PORTFOLIO.file({
  name: 'projects.ts',
  folder: 'src',
  lang: 'ts',
  content: `export interface Project {
  name: string;
  meta: string;
  blurb: string;
  stack: string[];
  when: string;
}

export const projects: Project[] = [
  {
    name: 'Serverless Deploy Automation',
    meta: 'AWS Infrastructure',
    blurb:
      'Script-driven serverless deployment pipeline provisioning AWS Lambda, ' +
      'DynamoDB, API Gateway v2, S3, Cognito and IAM with auto-incrementing ' +
      'environment naming. JWT auth via Cognito with RS256 token verification ' +
      'using the JWKS endpoint, plus a full teardown script that deletes all ' +
      'provisioned resources in reverse dependency order.',
    stack: ['Python', 'boto3', 'AWS Lambda', 'DynamoDB', 'API Gateway', 'Cognito', 'IAM', 'S3'],
    when: 'Jan – Feb 2026',
  },
  {
    name: 'NEET RAG',
    meta: 'AI / Local LLM',
    blurb:
      'Fully local RAG pipeline that answers NEET queries from custom PDF ' +
      'material, using PyMuPDF for parsing, Sentence Transformers for embeddings ' +
      'and FAISS for vector search. Offline inference via TinyLlama and llama.cpp, ' +
      'with a multi-turn Streamlit interface that feeds conversation history back ' +
      'into the prompt for grounded answers.',
    stack: ['Python', 'FAISS', 'Sentence Transformers', 'llama.cpp', 'PyMuPDF', 'Streamlit'],
    when: 'Aug 2025',
  },
  {
    name: 'Frontend Showcase',
    meta: 'Interactive Web',
    blurb:
      'A collection of interactive front-end experiences and data visualisations ' +
      'built across the year, including choropleths, knowledge graph renderers and ' +
      'scrollytelling pieces. Custom relief-map rendering and geospatial ' +
      'interactivity built with Leaflet, Mapbox, Cesium, D3.js and GSAP.',
    stack: ['JavaScript', 'Leaflet', 'Mapbox', 'Cesium', 'D3.js', 'GSAP'],
    when: '2025',
  },
];

export default projects;
`
});
