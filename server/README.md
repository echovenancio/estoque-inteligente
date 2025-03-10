## Env

O código que acessa o banco de dados é dependente de algumas variáveis de ambiente, que são:

```
ENV=dev
FIREBASE_PROJECT_ID=id-do-prjeto
FIREBASE_API_KEY=chave-da-api
```

Quando ENV=dev, o código acessa um banco sqlite local, que é criado automaticamente. Quando ENV está setado
para qualquer outro valor o código acessa o banco de dados do Firebase e para isso você precisa preencher as duas
variáveis de ambiente.

## Setando variáveis de ambiente

considerando a seguinte estrutura de diretórios:

```
-estoque-inteligente
 -mobile
 -server
```

o arquivo .env deve estar na raiz do projeto, ou seja, no diretório estoque-inteligente.

## Venv

Dentro do diretório server, crie um ambiente virtual com o comando:

```
python3 -m venv venv3
```

Caso use um diretorio venv com um nome diferente não esqueça de adicionar o nome do diretorio ao .gitignore

Ative o ambiente virtual com o comando:

```
# Linux
source venv3/bin/activate

# Windows
venv3\Scripts\activate
```

E instale as dependências com o comando:

```
pip install -r requirements.txt
```

## Rodando o servidor

Para rodar o servidor, execute o comando:

```
fastapi dev apy.py
```
