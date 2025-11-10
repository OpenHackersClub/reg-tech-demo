# Document Parsing & Classification — Improvement Plan

This plan optimizes the document parsing and classification pipeline in `apps/idp-service` to improve accuracy, latency, observability, and reliability. It leverages existing architecture, the Effect ecosystem (Schema, Layer, Service), and AI integration patterns.

## Current Architecture (Summary)
- Endpoints: `POST /document/parse` runs classification then type-specific extraction; `POST /document/classify` returns classification only (`src/modules/document/route.ts`).
- Ingestion: `validateFileEntry` accepts images, PDFs (converted to images), and CSVs; CSVs are turned into a string via `parseCsv` (`src/modules/document/utils`).
- Classification: `LanguageModel.generateObject` with `DocumentClassificationSchema` and `CLASSIFY_PROMPT` (`service/classify.ts`).
- Extraction: Chosen by classified type; prompts per type; returns structured objects using Effect `Schema` (`service/extraction.ts`, `schema/extraction.ts`).
- AI setup: OpenAI client and Layer via `OpenAiWithHttp` (`src/service/ai.ts`).

## Goals
- Increase classification accuracy and confidence calibration.
- Reduce latency and cost (adaptive model selection, smarter preprocessing).
- Strengthen schema validation and deterministic post-processing.
- Improve resilience (fallbacks, retries, observability, caching).
- Support multi-page documents and large inputs robustly.

## Key Improvements

### 1) Ingestion & Preprocessing
- Normalize images before AI calls: downscale to a max width (e.g., 1024px), deskew, binarize and sharpen to improve OCR/vision signal.
- PDF handling: attempt text extraction first (e.g., `pdfjs` or `@mozilla/pdfjs-dist`) and only fall back to image conversion if text extraction is poor.
- CSV handling: stream parse with small sample summaries (headers + first N rows + typed inference) to reduce prompt length while keeping structure.
- MIME sniffing and safety: verify file type via both header and content-based checks to prevent misclassification.
- Segmenting: represent inputs as `segments` (pages or chunks) for multi-page docs. Process segments in parallel but merge deterministically.

References: Effect Platform & Runtime for resource management and concurrency orchestration ([Runtime](https://effect.website/docs/platform/runtime/), [Scope](https://effect.website/docs/resource-management/scope/)).

### 2) Classification Strategy
- Prompt tightening: make the `CLASSIFY_PROMPT` shorter and strictly aligned to `DocumentClassificationSchema`. Include top-2 secondary suggestions and explicit confidence bounds [0,1].
- Few-shot examples: add 1–2 minimal examples per type to stabilize outputs.
- Adaptive model choice: default to a small/fast model when inputs are short or “clear”; escalate to larger multi-modal models when confidence < threshold.
- Heuristic pre-classifier: keyword regex and layout cues to pre-score types before LLM; combine with LLM via simple ensemble logic.
- Confidence thresholds: map low-confidence to `unknown`; require `confidence >= 0.7` for accepting a single type; otherwise return alternatives.

References: Effect Services to encapsulate classification logic and allow dependency swapping ([Services](https://effect.website/docs/requirements-management/services/)).

### 3) Extraction Enhancements
- Strict schema refinements: use `Schema.refine` for business rules (e.g., invoice subtotal consistency, receipt totals, date order checks for CI/BR).
- Deterministic post-processing: normalize dates (ISO 8601), currencies, and numbers; coerce optional fields and unify null semantics.
- Segment-aware extraction: run extraction per segment, then merge using rules (latest totals, union of line items, deduped references).
- Edge-case routing: if classification is uncertain, run light extraction attempts for likely types and pick best fit by validation scores.
- Markdown field: keep, but bound length with summary prompts; generate concise explanations and provenance notes.

References: Effect Schema and advanced usage ([Schema Intro](https://effect.website/docs/schema/introduction/), [Advanced Usage](https://effect.website/docs/schema/advanced-usage/), [Error Formatters](https://effect.website/docs/schema/error-formatters/)).

### 4) Concurrency, Caching, and Resilience
- Concurrency: limit concurrent segment calls via an Effect-managed pool; batch requests safely.
- Caching: hash input images/pages and cache classification/extraction results for exact repeats; include TTL.
- Retries with backoff: transient model/API errors should retry with jitter and capped attempts.
- Timeouts: per segment and whole request timeouts; graceful cancellation with `Scope`.
- Observability: log structured traces with timing, model used, tokens, confidence, and schema validation results.

References: Resource and state management ([Scope](https://effect.website/docs/resource-management/scope/), [Ref](https://effect.website/docs/state-management/ref/)).

### 5) Prompt & Token Budget Discipline
- Minify prompts: remove verbose prose; keep bullet requirements and explicit JSON shape.
- Page summaries: summarize long pages, then feed compact representations into extraction.
- Image detail: choose `imageDetail: 'low'|'auto'` based on resolution; avoid overpaying for high detail when text is readable.

### 6) Security & Compliance
- Redaction: scrub PII from logs and traces; never store raw documents unless required.
- Config hygiene: keep secrets in env; avoid accidental leaks in `/` endpoint.
- Deterministic schema handling: reject documents with insufficient info by returning `unknown` + reasoning.

## Proposed Refactor Plan

### Phase 1 — Foundations (Low Risk)
- Create `utils/preprocess.ts`: image normalization, PDF text-first, segmentation.
- Introduce `types.ts` for `IngestedDoc`, `DocSegment`, and merged result types.
- Add `classification/heuristics.ts`: quick keyword/layout scoring; export `preScore(doc) => Map<type,score>`.
- Tighten `DocumentClassificationSchema`: enforce `[0,1]` bounds, limit `secondary_classifications` length.
- Add validators: `schema/extraction.ts` refinements for totals, date ordering, ID formats.
- Observability: structured logging for endpoints and services with timing, model, confidence.

### Phase 2 — Classification & Extraction
- Update `service/classify.ts` to accept segments; incorporate heuristics into the prompt context and decision logic.
- Add few-shot examples in `prompts/classification.ts` and shrink prose.
- Adaptive model selection in `service/ai.ts`: small-fast vs large-multimodal based on input and confidence.
- Update `service/extraction.ts` to support segment merging and fallback extraction attempts when classification is uncertain.

### Phase 3 — Concurrency & Caching
- Add a simple Effect-managed pool for segment processing.
- Introduce a cache key per segment (hash of bytes/text) and cache results in-memory (optionally pluggable store).
- Implement retry/backoff and timeouts at service boundaries; ensure cancellation via `Scope`.

### Phase 4 — Evaluation & QA
- Create a test corpus (synthetic + anonymized real samples) for BR/CI/License/Invoice/Receipt.
- Metrics: accuracy, precision/recall, latency, cost per request, confidence calibration.
- Regression checks after changes; maintain confusion matrix to monitor drift.

## Acceptance Criteria
- Classification accuracy improves by ≥10% across the test corpus; `unknown` used appropriately when confidence < 0.7.
- Extraction validations pass for ≥95% of valid samples; totals/date checks enforced.
- Latency reduced by ≥20% for typical docs via preprocessing and adaptive models.
- Observability present: traces include model, tokens, timings, confidence, and schema validation results.
- Robustness: retries/backoff and timeouts prevent hanging requests; graceful cancellation works.

## Implementation Notes (Effect Ecosystem)
- Use Effect `Service` for `DocumentIngestion`, `DocumentClassifier`, `DocumentExtractor` to separate concerns ([Services](https://effect.website/docs/requirements-management/services/)).
- Manage resources and cancellation via `Scope`; run pools under a single scope per request ([Scope](https://effect.website/docs/resource-management/scope/)).
- Centralize schemas and refinements; leverage custom error formatters for better developer feedback ([Error Formatters](https://effect.website/docs/schema/error-formatters/)).
- Consider the Effect LSP to scaffold and refactor services more safely ([Devtools / LSP](https://effect.website/docs/getting-started/devtools/)).

## Risks & Mitigations
- Model variability: mitigate with few-shot examples and stricter schema checks.
- Cost spikes: reduce prompt size, adaptive detail, caching repeat work.
- PDF diversity: fallback to image-based extraction when text is low quality.
- Overfitting to prompts: keep prompts compact and type-agnostic; validate by schemas.

## Next Steps
- Implement Phase 1 modules and validators.
- Run baseline measurements and establish a test corpus.
- Iterate Phase 2–3 changes, measuring accuracy/latency at each step.
- Ship Phase 4 evaluation and freeze prompts/schemas once metrics stabilize.