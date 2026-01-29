In order to run the project locally with docker youll have to do 2 things.

## Create docker-compose.override
- Create a file named `docker-compose.override.yml` with the contents
```yml
services:
  home_inventory:
    ports:
      - "${PORT}:${PORT}"
```
- the reason for this is otherwise the docker contaner is not accessible on the port. Doing ports" **some port numer** opens the home_inventory container on that port, sp you can access it in your browser.

- Additionally, if you want to expose the mongo port you can also add:
```yml
  mongo:
    ports:
      - "27018:27017"
```