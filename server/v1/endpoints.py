from fastapi import APIRouter, Request, Security

import utils
from database.manager_getter import get_db_manager
from domain.models import ResProduto, Produto, Login, LoginRes

router = APIRouter()
db = get_db_manager()

@router.post("/login")
def login(login: Login) -> LoginRes:
    response = db.login(login.email, login.password)
    return response

@router.get("/estoque")
def estoque(request: Request, token = Security(utils.api_key_scheme)) -> list[ResProduto]:
    auth_token = utils.get_auth(token)
    estoque = db.get_estoque(auth_token)
    return estoque

@router.get("/categorias")
def get_categorias(request: Request, token = Security(utils.api_key_scheme)) -> list[str]:
    auth_token = utils.get_auth(token)
    categorias = db.get_categorias(auth_token)
    return categorias


@router.get("/estoque/{id}")
def get_produto(request: Request, id: str, token = Security(utils.api_key_scheme)) -> ResProduto:
    auth_token = utils.get_auth(token)
    produto = db.get_produto(id, auth_token)
    return produto

@router.post("/estoque")
def add_estoque(produto: Produto, token = Security(utils.api_key_scheme)) -> ResProduto:
    auth_token = utils.get_auth(token)
    ret_prod = db.add_estoque(produto, auth_token)
    utils.background_job(utils.update_cluster, token, db)
    return ret_prod 

@router.put("/estoque/{id}")
def update_estoque(produto: Produto, id: str, token = Security(utils.api_key_scheme)) -> ResProduto:
    auth_token = utils.get_auth(token)
    updated_produto = db.update_estoque(id, produto, auth_token)
    utils.background_job(utils.update_cluster, token, db)
    return updated_produto 

@router.get("/health")
def health_check() -> dict:
    return {"status": "ok"}
