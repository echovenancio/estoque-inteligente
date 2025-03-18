from fastapi import FastAPI, Request, HTTPException, Security
from fastapi.openapi.models import APIKey
from fastapi.openapi.models import SecuritySchemeType
from fastapi.security.api_key import APIKeyHeader
from database import get_db_manager
from pydantic import BaseModel
from dotenv import load_dotenv
from models import ResProduto, Produto, Login, LoginRes

load_dotenv()

app = FastAPI()
db = get_db_manager()

def map_produto(row) -> ResProduto:
    return ResProduto(id=row[0], nm_produto=row[1], quantidade=row[2], status=row[3], created_at=row[4], updated_at=row[5])

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

@app.get("/estoque/{id}")
def get_produto(request: Request, id: str, token = Security(api_key_scheme)) -> ResProduto:
    auth_token = get_auth(token)
    produto = db.get_produto(id, auth_token)
    return produto

@app.post("/estoque")
def add_estoque(produto: Produto, token = Security(api_key_scheme)) -> ResProduto:
    auth_token = get_auth(token)
    ret_prod = db.add_estoque(produto, auth_token)
    return ret_prod 

@app.put("/estoque/{id}")
def update_estoque(produto: Produto, id: str, token = Security(api_key_scheme)) -> ResProduto:
    auth_token = get_auth(token)
    print(produto)
    updated_produto = db.update_estoque(id, produto, auth_token)
    return updated_produto 

@app.get("/")
def root():
    return {"Hello": "World"}
