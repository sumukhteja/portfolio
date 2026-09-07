# Case studies

Three problems worth writing down. Each one: what was wrong, what I tried,
what broke, what shipped, and what it moved.

---

## Purchase orders that ate a working week

**Problem.** Flyberry Gourmet processed roughly 100 purchase orders a week by
hand. Every PO arrived as a PDF; someone retyped line items, pricing and HSN
codes into a spreadsheet before anything could be invoiced.

**What I tried.** Straight text extraction first — pull the text layer out of
the PDF and split it on whitespace.

**What broke.** PO layouts were not consistent between suppliers. Column
positions drifted, multi-line item descriptions collapsed into their
neighbours, and HSN codes silently merged with the quantity beside them. Text
order is not table structure.

**What I shipped.** A Flask REST API using `pdfplumber` to read the PDFs
positionally — words grouped by their bounding boxes rather than by reading
order, so a wrapped description stays one field. Output is a CSV that drops
straight into the existing workflow. Deployed as a static front end on
S3/CloudFront with a Lambda and API Gateway backend, so it costs nothing while
idle.

**Result.** ~100 POs a week processed without manual entry, cutting about
**20 hours of data entry per week**.

---

## A backend that could not fail in pieces

**Problem.** Ingestion, processing and reporting at Girgit ran as one path.
A slow or failing downstream step held up everything upstream of it, and load
on one part meant scaling all of it.

**What I tried.** Direct service-to-service calls behind API Gateway, with
retries at the caller.

**What broke.** Retries on a synchronous chain make a bad afternoon worse:
a slow processing step turned into API Gateway timeouts, the caller retried,
and the retries added load to the thing that was already struggling. Failure in
one stage was indistinguishable from failure of the whole request.

**What I shipped.** An event-driven design I owned from high- and low-level
design through delivery: Lambda, API Gateway, DynamoDB, S3, Cognito and IAM,
with SQS queues and SNS fan-out between stages. Each stage consumes at its own
rate, retries against its own queue, and drains to a dead-letter queue instead
of into the caller. CloudWatch metrics and structured logging cover latency,
error rate and throughput per stage.

**Result.** Ingestion, processing and reporting now scale and fail
independently — a stalled consumer backs up its own queue and nothing else.

---

## Answers from a document corpus, with nothing leaving the machine

**Problem.** Questions needed answering out of a large document corpus, and
the documents could not be shipped to a hosted model.

**What I tried.** Plain vector search over page-level chunks, answer from the
top hit.

**What broke.** Page-sized chunks retrieved the right document and the wrong
paragraph, and a scanned page has no text layer at all — those documents were
invisible to retrieval. Follow-up questions ("what about the second one?")
retrieved nothing, because the question alone carried no context.

**What I shipped.** A retrieval pipeline running entirely locally: OCR so
scanned pages are searchable, FAISS over smaller overlapping chunks, a Neo4j
knowledge graph for relationships that embeddings miss, and local models
through Ollama. Multi-turn conversation history feeds back into the prompt so
follow-ups resolve. MCP servers expose the retrieval tools to the models
directly.

**Result.** Grounded answers over the full corpus, inference and documents
both staying on local infrastructure.
