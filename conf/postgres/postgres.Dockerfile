FROM postgres:12.3
COPY conf/postgres/*.sql /docker-entrypoint-initdb.d/
