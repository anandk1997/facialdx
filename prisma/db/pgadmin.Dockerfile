# Use official pgAdmin image from Docker Hub
FROM dpage/pgadmin4

# Environment variables
ENV PGADMIN_DEFAULT_EMAIL=anand@example.com
ENV PGADMIN_DEFAULT_PASSWORD=anand

# Expose pgAdmin port
EXPOSE 80

# Start pgAdmin
CMD ["python", "run_pgadmin.py"]
