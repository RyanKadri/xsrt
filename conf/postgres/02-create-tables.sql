CREATE TYPE public.chunk_type AS ENUM
    ('snapshot', 'diff');

CREATE TABLE public.target
(
    id serial,
    name text COLLATE pg_catalog."default" NOT NULL,
    customer_id text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT target_pkey PRIMARY KEY (id)
);

CREATE TABLE public.recording
(
    id serial,
    uuid uuid,
    target integer NOT NULL,
    thumbnail_path text,
    start_time timestamp with time zone NOT NULL,
    duration integer,
    ua_details json,
    finalized boolean,
    CONSTRAINT recording_pkey PRIMARY KEY (id),
    CONSTRAINT target_fkey FOREIGN KEY (target)
      REFERENCES public.target (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE CASCADE
);

CREATE TABLE public.chunk
(
    id serial,
    uuid uuid,
    chunk_type chunk_type NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    recording integer NOT NULL,
    init_chunk boolean NOT NULL,
    snapshot json NOT NULL,
    changes json[] NOT NULL,
    inputs json NOT NULL,
    CONSTRAINT chunk_pkey PRIMARY KEY (id),
    CONSTRAINT recording_fkey FOREIGN KEY (recording)
      REFERENCES public.recording (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE CASCADE
);

CREATE TABLE public.asset
(
    id serial,
    orig_url text NOT NULL,
    proxy_path text,
    hash uuid,
    headers json[],
    PRIMARY KEY (id)
);

CREATE TABLE public.chunk_assets
(
    chunk_id integer,
    asset_id integer,
    PRIMARY KEY (chunk_id, asset_id),
    CONSTRAINT chunk_fkey FOREIGN KEY (chunk_id)
        REFERENCES public.chunk (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT asset_fkey FOREIGN KEY (asset_id)
        REFERENCES public.asset (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
);

ALTER TYPE public.chunk_type OWNER TO xsrt;
ALTER TABLE public.target OWNER to xsrt;
ALTER TABLE public.recording OWNER to xsrt;
ALTER TABLE public.chunk OWNER to xsrt;
ALTER TABLE public.asset OWNER to xsrt;
ALTER TABLE public.chunk_assets OWNER to xsrt;
