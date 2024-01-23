# create-elysiajs

## Scaffolding your [Elysia](https://elysiajs.com/) project with the environment with easy!

### With [bun](https://bun.sh/)

```bash
bun create elysiajs <dir>
```

> Support for other package managers will appear later (Maybe, huh)

## Supported environment

-   Linters
-   -   [Biome](https://biomejs.dev/)
-   -   [ESLint](https://eslint.org/)
-   ORM/Query builders
-   -   [Prisma](https://www.prisma.io/)
-   -   [Drizzle](https://orm.drizzle.team/)
-   Plugins
-   -   [CORS](https://elysiajs.com/plugins/cors.html)
-   -   [Swagger](https://elysiajs.com/plugins/swagger.html)
-   -   [JWT](https://elysiajs.com/plugins/jwt.html)
-   -   [Autoload](https://github.com/kravetsone/elysia-autoload)
-   -   [HTML/JSX](https://elysiajs.com/plugins/html.html)
-   -   [Static](https://elysiajs.com/plugins/static.html)
-   -   [Bearer](https://elysiajs.com/plugins/bearer.html)
-   -   [Server Timing](https://elysiajs.com/plugins/server-timing.html)
-   Others
-   -   [Husky](https://typicode.github.io/husky/) (Git hooks)
-   And more soon...

> The environment can work `together`
>
> When you select [ESLint](https://eslint.org/) and [Drizzle](https://orm.drizzle.team/), you get [eslint-plugin-drizzle](https://orm.drizzle.team/docs/eslint-plugin)
>
> When you select [Husky](https://typicode.github.io/husky/) and one of the [linters](#supported-environment) - the `pre-commit` hook will contain the command `lint:fix`

