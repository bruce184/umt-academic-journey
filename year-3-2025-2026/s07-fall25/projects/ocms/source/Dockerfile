FROM postgres:latest

# Copies all SQL files to special entrypoint
COPY sql/ /docker-entrypoint-initdb.d/

# Makes sure file is executable for the container to run
RUN chown postgres:postgres /docker-entrypoint-initdb.d/*.sql

EXPOSE 5432
