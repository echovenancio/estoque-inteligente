from fastapi import FastAPI, Request, HTTPException, Security
from fastapi.openapi.models import APIKey
from fastapi.openapi.models import SecuritySchemeType
from fastapi.security.api_key import APIKeyHeader
from database import DBManager
from pydantic import BaseModel
from models import ResProduto, Produto, Login, LoginRes

app = FastAPI()
db = DBManager()

def map_produto(row) -> ResProduto:
    return ResProduto(id=row[0], nm_produto=row[1], qt=row[2])

def get_auth(token) -> str:
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    return token.split(" ")[1]

api_key_scheme = APIKeyHeader(name="Authorization", auto_error=False)

@app.post("/login")
def login(login: Login) -> LoginRes:
    response = db.login(login.email, login.password)
    print(response)
    return response

@app.get("/estoque")
def estoque(request: Request, token = Security(api_key_scheme)):
    auth_token = get_auth(token)
    estoque = db.get_estoque(auth_token)
    print(estoque)
    return estoque

@app.get("/estoque/{id}")
def get_produto(request: Request, id: int, token = Security(api_key_scheme)) -> ResProduto:
    auth_token = get_auth(token)
    row = db.get_produto(id, auth_token)
    print(row)
    return map_produto(row)

@app.post("/estoque")
def add_estoque(produto: Produto, token = Security(api_key_scheme)) -> dict:
    auth_token = get_auth(token)
    id = db.add_estoque(produto, auth_token)
    print(id)
    return {"id": id}

@app.put("/estoque/{id}")
def update_estoque(produto: Produto, id: int, token = Security(api_key_scheme)) -> dict:
    auth_token = get_auth(token)
    rowcount = db.update_estoque(id, produto, auth_token)
    print(rowcount)
    return {"rowcount": rowcount}

@app.get("/")
def root():
    return {"Hello": "World"}
