FOR LOCAL DATABASE SETUP

(1) Create a Docker network

    docker network create postgres-network

(2) Create and run Database

    docker run --name postgres-container --network=postgres-network -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=mydatabase -p 5433:5432 -d postgres

    docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgres-container

(3) FOR RUNNING PGADMIN CONTAINER

    docker run --name pgadmin-container --network=postgres-network -p 81:80 -e 'PGADMIN_DEFAULT_EMAIL=anand@example.com' -e 'PGADMIN_DEFAULT_PASSWORD=anand' -d dpage/pgadmin4

(4) Access the PG-Admin Portal

    http://localhost:81/

(5) Configure the new server connection:

    In the "General" tab:

    Name: Enter a name for your server, such as Postgres.
    In the "Connection" tab:

    Host name/address: postgres-container (This is the name of your PostgreSQL container within the Docker network)
    Port: 5432 (default PostgreSQL port)
    Username: myuser
    Password: mypassword
    Maintenance database: mydatabase (Optional, you can leave it as postgres or the database you want to connect to by default)

Configure VPS:
docker exec -it postgres-container bash
echo "listen_addresses='\*'" >> /var/lib/postgresql/data/postgresql.conf
echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf
exit

    docker restart postgres-container

    sudo ufw allow 5433/tcp
    sudo ufw allow 81/tcp

Connect to vps
psql -h [Your Public IP] -U myuser -d mydatabase
http://[Your Public IP]:81/
