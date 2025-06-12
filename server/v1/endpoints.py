from fastapi import APIRouter, Request, Security

import utils
import ml
from database.manager_getter import get_db_manager
from domain.models import ResProduto, Produto, Login, LoginRes

router = APIRouter()
db = get_db_manager()

@router.post("/login")
def login(login: Login) -> LoginRes:
    response = db.login(login.email, login.password)
    print(f"Response from login: {response}")
    return response

@router.get("/estoque")
def estoque(request: Request, token = Security(utils.api_key_scheme)) -> list[ResProduto]:
    auth_token = utils.get_auth(token)
    estoque = db.get_estoque(auth_token)
    best_describer = ml.return_dict_of_clusterId_with_describer(estoque)
    if best_describer is not None:
        for produto in estoque:
            b = best_describer.get(produto.cluster_id, "")
            if b != "":
                produto.best_describer = b
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

@router.delete("/estoque/{id}")
def delete_produto(id: str, token = Security(utils.api_key_scheme)) -> bool:
    auth_token = utils.get_auth(token)
    deleted = db.delete_produto(id, auth_token)
    utils.background_job(utils.update_cluster, token, db)
    return deleted

@router.get("/health")
def health_check() -> dict:
    return {"status": "ok"}
