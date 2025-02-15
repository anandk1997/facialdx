# Use official PostgreSQL image from Docker Hub
FROM postgres:latest

# Environment variables
ENV POSTGRES_USER=myuser
ENV POSTGRES_PASSWORD=mypassword
ENV POSTGRES_DB=mydatabase

# Expose the PostgreSQL port
EXPOSE 5432

# Copy custom initialization scripts if needed
# COPY init.sql /docker-entrypoint-initdb.d/

# Start PostgreSQL
CMD ["postgres"]
