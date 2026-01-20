ALTER TABLE "tickets" ADD COLUMN "sla_hours" integer DEFAULT 24 NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "first_response_at" timestamp;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "resolved_at" timestamp;