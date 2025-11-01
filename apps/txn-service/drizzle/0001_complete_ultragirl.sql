CREATE TABLE IF NOT EXISTS "client_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"analysis_results" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
