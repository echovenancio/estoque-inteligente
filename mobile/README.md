# api.properties

Para configurar o ambiente para que o applicativo consiga acessar a API você precisa criar um arquivo chamado
`api.properties` na pasta `mobile` do projeto. Dentro do arquivo você deve adicionar as seguintes linhas:

```
apiUrl = _url_da_api_
```

Para conseguir o valor de `_url_da_api_` você deve rodar o a api na pasta `server` e procurar o ip da máquina que está rodando a api. O ip da máquina pode ser encontrado no terminal que está rodando a api.
o formato da string `apiUrl` deve ser `http://_ip_da_maquina_:8000/`
