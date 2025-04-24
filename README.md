# Mojaloop Reporting API

#### Build
From the repo root:
```sh
docker build -t reporting-api .
```

#### Run
Copy `.env.example` template to `.env` and modify it as you wish
```shell
cp .env.example .env
```
Run docker container
```sh
docker run -p 3000:3000 --env-file=.env reporting-api
```
where `reporting-api` is the image name from the build stage:

Open http://localhost:3000 in browser to run queries
