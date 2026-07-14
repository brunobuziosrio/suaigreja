# Operação e observabilidade

## Health check

`GET /health` responde `200` com JSON enquanto o servidor estiver atendendo. O deploy deve consultar esse endpoint depois de recriar o container.

## Monitoramento de erros

Use uma ferramenta de observabilidade (por exemplo, Sentry) com um DSN definido somente na VPS e no provedor de CI. Não versionar DSNs, tokens ou credenciais no repositório.

## E2E autenticado

Para habilitar o teste autenticado, configure uma conta exclusiva de homologação:

```text
E2E_USER_EMAIL=
E2E_USER_PASSWORD=
E2E_BASE_URL=https://homologacao.exemplo.com
```

Sem essas variáveis, o teste é ignorado para não acessar dados reais.
