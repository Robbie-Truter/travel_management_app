


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."accommodations" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "trip_id" bigint NOT NULL,
    "trip_country_id" bigint,
    "name" "text" NOT NULL,
    "type" "text" DEFAULT 'hotel'::"text" NOT NULL,
    "platform" "text",
    "location" "text" NOT NULL,
    "check_in" "text" NOT NULL,
    "check_out" "text" NOT NULL,
    "check_in_after" "text",
    "check_out_before" "text",
    "price" numeric DEFAULT 0 NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "booking_link" "text",
    "notes" "text",
    "image" "text",
    "is_confirmed" boolean DEFAULT false NOT NULL,
    "created_at" "text" NOT NULL,
    "destination_id" bigint
);


ALTER TABLE "public"."accommodations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."accommodations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."accommodations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."accommodations_id_seq" OWNED BY "public"."accommodations"."id";



CREATE TABLE IF NOT EXISTS "public"."activities" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "trip_id" bigint NOT NULL,
    "trip_country_id" bigint,
    "destination_id" bigint,
    "name" "text" NOT NULL,
    "date" "text" NOT NULL,
    "type" "text",
    "link" "text",
    "notes" "text",
    "duration" integer,
    "cost" numeric,
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "image" "text",
    "is_confirmed" boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "created_at" "text" NOT NULL
);


ALTER TABLE "public"."activities" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."activities_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."activities_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."activities_id_seq" OWNED BY "public"."activities"."id";



CREATE TABLE IF NOT EXISTS "public"."city_lookup" (
    "city" "text",
    "city_ascii" "text",
    "lat" double precision,
    "lng" double precision,
    "country" "text",
    "iso2" "text",
    "iso3" "text",
    "admin_name" "text",
    "capital" "text",
    "id" numeric NOT NULL,
    "country_id" bigint
);


ALTER TABLE "public"."city_lookup" OWNER TO "postgres";


COMMENT ON TABLE "public"."city_lookup" IS 'Lookup table for cities';



CREATE TABLE IF NOT EXISTS "public"."country_lookup" (
    "name" "text" NOT NULL,
    "demonym" "text",
    "iso2" "text" NOT NULL,
    "tld" "text",
    "currency" "text",
    "language" "text",
    "website" "text",
    "calling_code" "text",
    "continent" "text",
    "id" bigint NOT NULL,
    "iso3" "text"
);


ALTER TABLE "public"."country_lookup" OWNER TO "postgres";


COMMENT ON TABLE "public"."country_lookup" IS 'Lookup table for countries';



CREATE SEQUENCE IF NOT EXISTS "public"."country_lookup_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."country_lookup_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."country_lookup_id_seq" OWNED BY "public"."country_lookup"."id";



CREATE TABLE IF NOT EXISTS "public"."destinations" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "trip_id" bigint NOT NULL,
    "trip_country_id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "image" "text",
    "order" integer,
    "created_at" "text" NOT NULL,
    "city_lookup_id" numeric,
    "country_id" bigint NOT NULL
);


ALTER TABLE "public"."destinations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."destinations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."destinations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."destinations_id_seq" OWNED BY "public"."destinations"."id";



CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "trip_id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "type" "text" NOT NULL,
    "file" "text" NOT NULL,
    "created_at" "text" NOT NULL,
    "mime_type" "text"
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."documents_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."documents_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."documents_id_seq" OWNED BY "public"."documents"."id";



CREATE TABLE IF NOT EXISTS "public"."flights" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "trip_id" bigint NOT NULL,
    "trip_country_id" bigint NOT NULL,
    "description" "text",
    "segments" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "price" numeric DEFAULT 0 NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "booking_link" "text",
    "notes" "text",
    "is_confirmed" boolean DEFAULT false NOT NULL,
    "created_at" "text" NOT NULL,
    "destination_id" bigint NOT NULL
);


ALTER TABLE "public"."flights" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."flights_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."flights_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."flights_id_seq" OWNED BY "public"."flights"."id";



CREATE TABLE IF NOT EXISTS "public"."notes" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "trip_id" bigint NOT NULL,
    "content" "text" DEFAULT ''::"text" NOT NULL,
    "updated_at" "text" NOT NULL
);


ALTER TABLE "public"."notes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."notes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."notes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."notes_id_seq" OWNED BY "public"."notes"."id";



CREATE TABLE IF NOT EXISTS "public"."trip_countries" (
    "id" bigint NOT NULL,
    "trip_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "country_name" "text" NOT NULL,
    "country_code" "text" NOT NULL,
    "budget_limit" numeric DEFAULT 0,
    "notes" "text",
    "order" integer DEFAULT 0,
    "created_at" "text" NOT NULL,
    "country_id" bigint
);


ALTER TABLE "public"."trip_countries" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."trip_countries_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."trip_countries_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trip_countries_id_seq" OWNED BY "public"."trip_countries"."id";



CREATE TABLE IF NOT EXISTS "public"."trips" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "start_date" "text" NOT NULL,
    "end_date" "text" NOT NULL,
    "status" "text" DEFAULT 'planning'::"text" NOT NULL,
    "description" "text",
    "budget" "text",
    "destinations" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "cover_image" "text",
    "created_at" "text" NOT NULL,
    "updated_at" "text" NOT NULL,
    "base_currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    CONSTRAINT "check_currency_code_length" CHECK (("length"("base_currency") >= 3))
);


ALTER TABLE "public"."trips" OWNER TO "postgres";


COMMENT ON COLUMN "public"."trips"."base_currency" IS 'ISO 4217 currency code for the trip base currency';



CREATE SEQUENCE IF NOT EXISTS "public"."trips_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."trips_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trips_id_seq" OWNED BY "public"."trips"."id";



ALTER TABLE ONLY "public"."accommodations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."accommodations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."activities" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."activities_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."country_lookup" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."country_lookup_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."destinations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."destinations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."documents" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."documents_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."flights" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."flights_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."notes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trip_countries" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trip_countries_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trips" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trips_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."accommodations"
    ADD CONSTRAINT "accommodations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."city_lookup"
    ADD CONSTRAINT "city_lookup_composite_key" UNIQUE ("id", "country_id");



ALTER TABLE ONLY "public"."city_lookup"
    ADD CONSTRAINT "city_lookup_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."country_lookup"
    ADD CONSTRAINT "country_lookup_composite_unique" UNIQUE ("id", "iso2");



ALTER TABLE ONLY "public"."country_lookup"
    ADD CONSTRAINT "country_lookup_iso2_key" UNIQUE ("iso2");



ALTER TABLE ONLY "public"."country_lookup"
    ADD CONSTRAINT "country_lookup_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."country_lookup"
    ADD CONSTRAINT "country_lookup_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."destinations"
    ADD CONSTRAINT "destinations_composite_unique" UNIQUE ("id", "trip_country_id");



ALTER TABLE ONLY "public"."destinations"
    ADD CONSTRAINT "destinations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flights"
    ADD CONSTRAINT "flights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_countries"
    ADD CONSTRAINT "trip_countries_composite_unique" UNIQUE ("id", "country_id");



ALTER TABLE ONLY "public"."trip_countries"
    ADD CONSTRAINT "trip_countries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "unique_user_trip_note" UNIQUE ("user_id", "trip_id");



ALTER TABLE ONLY "public"."accommodations"
    ADD CONSTRAINT "accommodations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."accommodations"
    ADD CONSTRAINT "accommodations_trip_country_id_fkey" FOREIGN KEY ("trip_country_id") REFERENCES "public"."trip_countries"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."accommodations"
    ADD CONSTRAINT "accommodations_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."accommodations"
    ADD CONSTRAINT "accommodations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_trip_country_id_fkey" FOREIGN KEY ("trip_country_id") REFERENCES "public"."trip_countries"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."destinations"
    ADD CONSTRAINT "destinations_city_lookup_id_fkey" FOREIGN KEY ("city_lookup_id") REFERENCES "public"."city_lookup"("id");



ALTER TABLE ONLY "public"."destinations"
    ADD CONSTRAINT "destinations_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."country_lookup"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."destinations"
    ADD CONSTRAINT "destinations_trip_country_id_country_id_fkey" FOREIGN KEY ("trip_country_id", "country_id") REFERENCES "public"."trip_countries"("id", "country_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."destinations"
    ADD CONSTRAINT "destinations_trip_country_id_fkey" FOREIGN KEY ("trip_country_id") REFERENCES "public"."trip_countries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."destinations"
    ADD CONSTRAINT "destinations_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."destinations"
    ADD CONSTRAINT "destinations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flights"
    ADD CONSTRAINT "flights_destination_fk" FOREIGN KEY ("destination_id", "trip_country_id") REFERENCES "public"."destinations"("id", "trip_country_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flights"
    ADD CONSTRAINT "flights_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flights"
    ADD CONSTRAINT "flights_trip_country_id_fkey" FOREIGN KEY ("trip_country_id") REFERENCES "public"."trip_countries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flights"
    ADD CONSTRAINT "flights_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flights"
    ADD CONSTRAINT "flights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_countries"
    ADD CONSTRAINT "trip_countries_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."country_lookup"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."trip_countries"
    ADD CONSTRAINT "trip_countries_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_countries"
    ADD CONSTRAINT "trip_countries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Users can delete their own trips" ON "public"."trips" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own trips" ON "public"."trips" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own accommodations" ON "public"."accommodations" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own activities" ON "public"."activities" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own destinations" ON "public"."destinations" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own documents" ON "public"."documents" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own flights" ON "public"."flights" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own trip_countries" ON "public"."trip_countries" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own trips" ON "public"."trips" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own trips" ON "public"."trips" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."accommodations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."city_lookup" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."country_lookup" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."destinations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."flights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trips" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON TABLE "public"."accommodations" TO "anon";
GRANT ALL ON TABLE "public"."accommodations" TO "authenticated";
GRANT ALL ON TABLE "public"."accommodations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."accommodations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."accommodations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."accommodations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";



GRANT ALL ON SEQUENCE "public"."activities_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."activities_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."activities_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."city_lookup" TO "anon";
GRANT ALL ON TABLE "public"."city_lookup" TO "authenticated";
GRANT ALL ON TABLE "public"."city_lookup" TO "service_role";



GRANT ALL ON TABLE "public"."country_lookup" TO "anon";
GRANT ALL ON TABLE "public"."country_lookup" TO "authenticated";
GRANT ALL ON TABLE "public"."country_lookup" TO "service_role";



GRANT ALL ON SEQUENCE "public"."country_lookup_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."country_lookup_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."country_lookup_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."destinations" TO "anon";
GRANT ALL ON TABLE "public"."destinations" TO "authenticated";
GRANT ALL ON TABLE "public"."destinations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."destinations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."destinations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."destinations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON SEQUENCE "public"."documents_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."documents_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."documents_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."flights" TO "anon";
GRANT ALL ON TABLE "public"."flights" TO "authenticated";
GRANT ALL ON TABLE "public"."flights" TO "service_role";



GRANT ALL ON SEQUENCE "public"."flights_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."flights_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."flights_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notes" TO "anon";
GRANT ALL ON TABLE "public"."notes" TO "authenticated";
GRANT ALL ON TABLE "public"."notes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trip_countries" TO "anon";
GRANT ALL ON TABLE "public"."trip_countries" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_countries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trip_countries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trip_countries_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trip_countries_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trips" TO "anon";
GRANT ALL ON TABLE "public"."trips" TO "authenticated";
GRANT ALL ON TABLE "public"."trips" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trips_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trips_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trips_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







