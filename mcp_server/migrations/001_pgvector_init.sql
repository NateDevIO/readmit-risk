-- Phase 1 RAG foundation: enable pgvector and create the clinical_notes table
-- used to store embedded clinical text chunks for retrieval-augmented chat.
--
-- Embedding dimension is 512 to match Voyage's voyage-3-lite model. If the
-- embedding model is changed, update EMBEDDING_DIM in mcp_server/embeddings.py
-- AND issue a follow-up migration that recreates the column at the new size.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS clinical_notes (
    id          BIGSERIAL    PRIMARY KEY,
    source_id   TEXT         NOT NULL,
    note_type   TEXT         NOT NULL,
    content     TEXT         NOT NULL,
    embedding   VECTOR(512)  NOT NULL,
    metadata    JSONB        NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- HNSW index tuned for cosine similarity. HNSW gives better recall than
-- IVFFlat and does not require pre-loaded training data, so it is safe to
-- create on an empty table.
CREATE INDEX IF NOT EXISTS clinical_notes_embedding_hnsw_cosine_idx
    ON clinical_notes
    USING hnsw (embedding vector_cosine_ops);

-- Common filter columns for hybrid retrieval.
CREATE INDEX IF NOT EXISTS clinical_notes_source_id_idx
    ON clinical_notes (source_id);

CREATE INDEX IF NOT EXISTS clinical_notes_note_type_idx
    ON clinical_notes (note_type);
