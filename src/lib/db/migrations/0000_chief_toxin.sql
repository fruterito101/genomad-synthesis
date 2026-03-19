CREATE TABLE "action_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"action_type" text NOT NULL,
	"proposed_by" uuid NOT NULL,
	"action_data" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_by" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rejected_by" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"required_share" real DEFAULT 50 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "agent_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"action" text NOT NULL,
	"old_data" jsonb,
	"new_data" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"bot_username" text,
	"dna_hash" text NOT NULL,
	"traits" jsonb NOT NULL,
	"fitness" real NOT NULL,
	"generation" integer DEFAULT 0 NOT NULL,
	"parent_a_id" uuid,
	"parent_b_id" uuid,
	"lineage" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"token_id" text,
	"contract_address" text,
	"minted_at" timestamp,
	"encrypted_dna" jsonb,
	"commitment" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"active_host" text,
	"is_suspicious" boolean DEFAULT false NOT NULL,
	"suspicious_reason" text,
	"flagged_at" timestamp,
	"reviewed_at" timestamp,
	"reviewed_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agents_dna_hash_unique" UNIQUE("dna_hash")
);
--> statement-breakpoint
CREATE TABLE "breeding_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"initiator_id" uuid NOT NULL,
	"parent_a_id" uuid NOT NULL,
	"parent_b_id" uuid NOT NULL,
	"parent_a_owner_id" uuid NOT NULL,
	"parent_b_owner_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"parent_a_approved" boolean DEFAULT false NOT NULL,
	"parent_b_approved" boolean DEFAULT false NOT NULL,
	"parent_a_approved_at" timestamp,
	"parent_b_approved_at" timestamp,
	"crossover_type" text DEFAULT 'weighted' NOT NULL,
	"child_name" text,
	"fee_amount" text,
	"fee_paid" boolean DEFAULT false NOT NULL,
	"fee_tx_hash" text,
	"on_chain_request_id" text,
	"on_chain_parent_a" text,
	"on_chain_parent_b" text,
	"child_id" uuid,
	"executed_at" timestamp,
	"tx_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custody_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"share" real NOT NULL,
	"source" text DEFAULT 'direct' NOT NULL,
	"inherited_from_agent_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suspicious_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_name" text NOT NULL,
	"reason" text NOT NULL,
	"traits" jsonb,
	"fitness" real,
	"file_stats" jsonb,
	"reported_at" timestamp NOT NULL,
	"source_ip" text,
	"source" text DEFAULT 'genomad-verify-skill',
	"reviewed" boolean DEFAULT false NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"review_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"privy_id" text NOT NULL,
	"telegram_id" text,
	"telegram_username" text,
	"wallet_address" text,
	"display_name" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "users_privy_id_unique" UNIQUE("privy_id"),
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
CREATE TABLE "verification_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(10) NOT NULL,
	"user_id" uuid NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp,
	"agent_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "verification_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE INDEX "approvals_agent_idx" ON "action_approvals" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "approvals_status_idx" ON "action_approvals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_audit_agent" ON "agent_audit_log" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_audit_action" ON "agent_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_time" ON "agent_audit_log" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX "agents_owner_idx" ON "agents" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "agents_dna_hash_idx" ON "agents" USING btree ("dna_hash");--> statement-breakpoint
CREATE INDEX "agents_token_id_idx" ON "agents" USING btree ("token_id");--> statement-breakpoint
CREATE INDEX "agents_generation_idx" ON "agents" USING btree ("generation");--> statement-breakpoint
CREATE INDEX "breeding_initiator_idx" ON "breeding_requests" USING btree ("initiator_id");--> statement-breakpoint
CREATE INDEX "breeding_status_idx" ON "breeding_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "breeding_parents_idx" ON "breeding_requests" USING btree ("parent_a_id","parent_b_id");--> statement-breakpoint
CREATE INDEX "custody_agent_idx" ON "custody_shares" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "custody_owner_idx" ON "custody_shares" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("read");--> statement-breakpoint
CREATE INDEX "notifications_created_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "suspicious_alerts_reviewed_idx" ON "suspicious_alerts" USING btree ("reviewed");--> statement-breakpoint
CREATE INDEX "suspicious_alerts_created_idx" ON "suspicious_alerts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_privy_id_idx" ON "users" USING btree ("privy_id");--> statement-breakpoint
CREATE INDEX "users_telegram_id_idx" ON "users" USING btree ("telegram_id");--> statement-breakpoint
CREATE INDEX "users_wallet_idx" ON "users" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "verification_code_idx" ON "verification_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "verification_user_idx" ON "verification_codes" USING btree ("user_id");