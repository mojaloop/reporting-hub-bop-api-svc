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

#### Changing database schema 
1. Update Prisma schema by performing introspection on existing database
> Note: this will overwrite existing schema in `./prisma/centralLedger.prisma`
```shell
npm run prisma:pull
```

2. Modify `./prisma/centralLedger.prisma` and `./prisma/eventStore.prisma` as needed


3. Validate schema
```shell
npm run prisma:validate
```

4. Format schema files
```shell
npm run prisma:format
```

5. Generate artifacts
```shell
npm run generate
```
