## Robert2 with Docker

### Startup guide

#### Prerequisites

At very first, you'll need to install
[Docker](https://docs.docker.com/install/linux/docker-ce/ubuntu/#os-requirements)
on your machine, as well as [docker-compose](https://docs.docker.com/compose/install/).

#### Build docker environment

Just run:

```bash
docker-compose up -d
```

And be patient! :)

#### Use Robert2 from running docker container

You can then access Robert2-api, using url http://localhost:8080. Just visit [the installer page](http://localhost:8080/install), and you're good to go!

In "database setup" step, you should specify `database` as Mysql host, and set mysql user `root` with password `root`.

#### Running tests from docker container

Database docker image does not comes with the "test" database (only the `robert2` one). So we need to create it first, otherwise tests will never run. To do that, you must first connect to a shell of the "DB" container:

```bash
docker container ls # shows all running containers.
# You'll have to find the one corresponding to `robert2/api-db` image, and copy its ID to use it:
docker exec -it [CONTAINER_ID] bash
```

Then, you can run:

```bash
mysql -u root -proot -e "CREATE DATABASE robert2_test;"
```

After that, you can exit the "DB" container:

```bash
exit
```

And login to the "WEB" container:

```bash
docker exec -it robert2/api-web bash
```

At this point, you're able to run `composer test`, or every composer related commands! Yay!!

#### Stop and remove docker containers

You only have to run:

```bash
docker-compose down
```

### Docker commands reminder (if needed)

In most cases, these commands won't be useful. But who knows...

#### build image

    docker build -t robert2/api:latest .

#### List images

    docker images

#### List containers

```bash
docker ps # shows running containers
docker ps -a # shows all containers
```

#### Run image

    docker run -p 8080:80 --name="robert2-api" -v `pwd`:/app robert2/api

-> http://localhost:8080

#### Display logs from a container

    docker logs robert2-api

#### SSH to the container:

    docker exec -it robert2-api bash

-> Common IP addresses : 172.17.0.1/16

#### Stop container

- From TTY which is running container: just hit [CTRL + C].
- If container started with `-d` option (that stands for _"detached"_), just run: `docker stop robert2-api`

#### Destroy image:

    docker rmi -f {IMAGE ID}
