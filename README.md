# create-elysiajs

<div align="center">

[![npm](https://img.shields.io/npm/v/create-elysiajs?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/create-elysiajs)
[![npm downloads](https://img.shields.io/npm/dw/create-elysiajs?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/create-elysiajs)

</div>

## Scaffolding your [Elysia](https://elysiajs.com/) project with the environment with easy!

### With [bun](https://bun.sh/)

```bash
bun create elysiajs <dir>
```

> Support for other package managers will appear later (Maybe, huh)

## Supported environment

-   Linters
-   -   [Biome](https://biomejs.dev/)
-   -   [ESLint](https://eslint.org/) with [@antfu/eslint-config](https://eslint-config.antfu.me/rules)
-   ORM/Query builders
-   -   [Prisma](https://www.prisma.io/)
-   -   [Drizzle](https://orm.drizzle.team/)
-   Plugins
-   -   [CORS](https://elysiajs.com/plugins/cors.html)
-   -   [Swagger](https://elysiajs.com/plugins/swagger.html)
-   -   [JWT](https://elysiajs.com/plugins/jwt.html)
-   -   [Autoload](https://github.com/kravetsone/elysia-autoload)
-   -   [Oauth 2.0](https://github.com/kravetsone/elysia-oauth2)
-   -   [HTML/JSX](https://elysiajs.com/plugins/html.html)
-   -   [Logger](https://github.com/bogeychan/elysia-logger)
-   -   [Static](https://elysiajs.com/plugins/static.html)
-   -   [Bearer](https://elysiajs.com/plugins/bearer.html)
-   -   [Server Timing](https://elysiajs.com/plugins/server-timing.html)
-   Others
-   -   [Dockerfile](https://www.docker.com/) + [docker-compose.yml](https://docs.docker.com/compose/)
-   -   [Jobify](https://github.com/kravetsone/jobify) ([Bullmq](https://docs.bullmq.io/) wrapper)
-   -   [Posthog](https://posthog.com/docs/libraries/node)
-   -   [Verrou](https://github.com/kravetsone/verrou) (Locks)
-   -   [Env-var](https://github.com/wobsoriano/env-var) (Environment variables)
-   -   [.vscode](https://code.visualstudio.com/) (VSCode settings)
-   -   [Husky](https://typicode.github.io/husky/) (Git hooks)
-   And more soon...

> With renovate, we keep dependencies up to date

> The environment can work `together`
>
> When you select [ESLint](https://eslint.org/) and [Drizzle](https://orm.drizzle.team/), you get [eslint-plugin-drizzle](https://orm.drizzle.team/docs/eslint-plugin)
>
> When you select [Husky](https://typicode.github.io/husky/) and one of the [linters](#supported-environment) - the `pre-commit` hook will contain the command `lint:fix`
