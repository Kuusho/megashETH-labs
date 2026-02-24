CREATE TABLE "daily_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"snapshot_date" text NOT NULL,
	"txs_that_day" integer DEFAULT 0 NOT NULL,
	"gas_spent_that_day" text DEFAULT '0' NOT NULL,
	"created_at" integer DEFAULT extract(epoch from now()) NOT NULL,
	CONSTRAINT "unique_address_date" UNIQUE("address","snapshot_date")
);
--> statement-breakpoint
CREATE TABLE "profile_wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"address" text NOT NULL,
	"is_primary" boolean DEFAULT false,
	"signature" text NOT NULL,
	"message" text NOT NULL,
	"added_at" integer NOT NULL,
	CONSTRAINT "profile_wallets_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE "user_activity" (
	"address" text PRIMARY KEY NOT NULL,
	"total_txs" integer DEFAULT 0 NOT NULL,
	"gas_spent_wei" text DEFAULT '0' NOT NULL,
	"gas_spent_eth" real DEFAULT 0 NOT NULL,
	"contracts_deployed" integer DEFAULT 0 NOT NULL,
	"days_active" integer DEFAULT 0 NOT NULL,
	"first_tx_timestamp" integer,
	"last_tx_timestamp" integer,
	"megaeth_native_score" integer DEFAULT 0 NOT NULL,
	"rank" integer,
	"last_updated" integer DEFAULT extract(epoch from now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"primary_address" text NOT NULL,
	"display_name" text,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile_wallets" ADD CONSTRAINT "profile_wallets_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_snapshot_address" ON "daily_snapshots" USING btree ("address");--> statement-breakpoint
CREATE INDEX "idx_snapshot_date" ON "daily_snapshots" USING btree ("snapshot_date");--> statement-breakpoint
CREATE INDEX "idx_pw_profile_id" ON "profile_wallets" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_pw_address" ON "profile_wallets" USING btree ("address");--> statement-breakpoint
CREATE INDEX "idx_user_score" ON "user_activity" USING btree ("megaeth_native_score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_user_rank" ON "user_activity" USING btree ("rank");--> statement-breakpoint
CREATE INDEX "idx_user_updated" ON "user_activity" USING btree ("last_updated");