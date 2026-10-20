# ne{s,x}t

Front em Next.js do fórum da API [LuizDevExe/nest-api](https://github.com/LuizDevExe/nest-api).

## Como rodar

```bash
cp .env.example .env.local
npm install
npm run dev
```

O `.npmrc` fixa `legacy-peer-deps=true`: sem ele, `npm install` quebra com um bug do
arborist do npm 10 ao resolver os peers opcionais do Vitest 4.
