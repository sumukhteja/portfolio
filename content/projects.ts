export interface Project {
  name: string;
  meta: string;
  blurb: string;
  stack: string[];
  when: string;
}

export const projects: Project[] = [
  {
    name: 'RAG for NEET aspirants',
    meta: 'AI / Retrieval',
    blurb:
      'RAG pipeline for NEET exam queries over custom material — PyMuPDF parsing, ' +
      'BGE embeddings, Cloudflare Vectorize storage and retrieval; inference fully ' +
      'offline on a 4-bit quantized Qwen-3-VL 8B.',
    stack: ['Python', 'PyMuPDF', 'BGE embeddings', 'Cloudflare Vectorize', 'Qwen-3-VL 8B'],
    when: 'Aug – Sep 2026',
  },
  {
    name: 'Fine-tuning an Open-Weight model with LoRA',
    meta: 'AI / Training',
    blurb:
      'Fine-tuned Qwen3.5-2B with LoRA to generate UPSC Mains Polity answers at ' +
      'rank 8, training only 0.149% of the model parameters. Ran fully local on ' +
      'Apple Silicon via MLX — 396 iterations, gradient checkpointing, 5.7GB peak ' +
      'memory; validation loss 3.41 to 2.84, test perplexity 14.9. Built a ' +
      '222-example training set from hand-curated Q&As across 10 Polity categories, ' +
      'balanced so no topic dominated the training signal.',
    stack: ['Python', 'MLX', 'LoRA', 'Qwen3.5-2B', 'Apple Silicon'],
    when: '2026',
  },
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
    name: 'Frontend Showcase',
    meta: 'Interactive Web',
    blurb:
      'A collection of interactive front-end experiences and data visualisations, ' +
      'including choropleths, knowledge graph renderers and scrollytelling pieces. ' +
      'Custom relief-map rendering and geospatial interactivity built with Leaflet, ' +
      'Mapbox, Cesium, D3.js and GSAP.',
    stack: ['JavaScript', 'Leaflet', 'Mapbox', 'Cesium', 'D3.js', 'GSAP'],
    when: '2025',
  },
];

export default projects;
