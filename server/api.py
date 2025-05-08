from fastapi import FastAPI, Request, HTTPException, Security
import json
import ml
import threading
from fastapi.openapi.models import APIKey
from fastapi.openapi.models import SecuritySchemeType
from fastapi.security.api_key import APIKeyHeader
from database import get_db_manager
from pydantic import BaseModel
from models import ResProduto, Produto, Login, LoginRes

app = FastAPI()
db = get_db_manager()

def background_job(func, *args):
    t = threading.Thread(target=func, args=args)
    t.daemon = True
    t.start()

def update_cluster(auth_token: str):
    produtos = db.get_estoque(auth_token)
    updated_cluster_id = ml.fit_model(produtos, max(1, int(len(produtos) / 5)))
    for produto, cluster_id in zip(produtos, updated_cluster_id):
        db.update_cluster(produto.id, int(cluster_id), auth_token)

def get_auth(token) -> str:
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    return token.split(" ")[1]

api_key_scheme = APIKeyHeader(name="Authorization", auto_error=False)

@app.post("/login")
def login(login: Login) -> LoginRes:
    response = db.login(login.email, login.password)
    return response

@app.get("/estoque")
def estoque(request: Request, token = Security(api_key_scheme)) -> list[ResProduto]:
    auth_token = get_auth(token)
    estoque = db.get_estoque(auth_token)
    return estoque

@app.get("/categorias")
def get_categorias(request: Request, token = Security(api_key_scheme)) -> list[str]:
    auth_token = get_auth(token)
    categorias = db.get_categorias(auth_token)
    return categorias


@app.get("/estoque/{id}")
def get_produto(request: Request, id: str, token = Security(api_key_scheme)) -> ResProduto:
    auth_token = get_auth(token)
    produto = db.get_produto(id, auth_token)
    return produto

@app.post("/estoque")
def add_estoque(produto: Produto, token = Security(api_key_scheme)) -> ResProduto:
    auth_token = get_auth(token)
    ret_prod = db.add_estoque(produto, auth_token)
    background_job(update_cluster, token)
    return ret_prod 

@app.put("/estoque/{id}")
def update_estoque(produto: Produto, id: str, token = Security(api_key_scheme)) -> ResProduto:
    auth_token = get_auth(token)
    updated_produto = db.update_estoque(id, produto, auth_token)
    background_job(update_cluster, token)
    return updated_produto 

@app.get("/")
def root():
    return {"Hello": "World"}
