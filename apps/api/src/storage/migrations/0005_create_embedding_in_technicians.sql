CREATE EXTENSION vector;
ALTER TABLE "technicians" ADD COLUMN "embedding" vector(1536);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embeddingIndex" ON "technicians" USING hnsw ("embedding" vector_cosine_ops);