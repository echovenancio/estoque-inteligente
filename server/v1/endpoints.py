from fastapi import APIRouter, Request, Security

import utils
import ml
from database.manager_getter import get_db_manager
from domain.models import ResProduto, Produto, Login, LoginRes

router = APIRouter()
db = get_db_manager()

from fastapi import APIRouter, Request, Response, Security
from database.manager_getter import get_db_manager
from domain.models import ResProduto, Produto, Login, LoginRes
import utils
import ml

router = APIRouter()
db = get_db_manager()


# --- OPTIONS helpers (one per route so browsers preflight same path) ---
@router.options("/login")
def options_login(response: Response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    response.headers["Access-Control-Max-Age"] = "86400"
    response.status_code = 204
    return response


@router.options("/estoque")
def options_estoque(response: Response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    response.headers["Access-Control-Max-Age"] = "86400"
    return Response(status_code=204)


@router.options("/categorias")
def options_categorias(response: Response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    response.headers["Access-Control-Max-Age"] = "86400"
    return Response(status_code=204)


@router.options("/estoque/low-stock")
def options_estoque_low_stock(response: Response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    response.headers["Access-Control-Max-Age"] = "86400"
    return Response(status_code=204)


@router.options("/estoque/{id}")
def options_estoque_id(id: str, response: Response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    response.headers["Access-Control-Max-Age"] = "86400"
    return Response(status_code=204)


@router.options("/health")
def options_health(response: Response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    response.headers["Access-Control-Max-Age"] = "86400"
    return Response(status_code=204)


# --- actual endpoints ---
@router.post("/login")
def login(login: Login) -> LoginRes:
    response = db.login(login.email, login.password)
    print(f"Response from login: {response}")
    return response


@router.get("/estoque")
def list_estoque(request: Request, token=Security(utils.api_key_scheme)) -> list[ResProduto]:
    auth_token = utils.get_auth(token)
    estoque = db.get_estoque(auth_token)
    best_describer = ml.return_dict_of_clusterId_with_describer(estoque)
    if best_describer is not None:
        for produto in estoque:
            b = best_describer.get(produto.cluster_id, "")
            if b != "":
                produto.best_describer = b.lower()
    return estoque


@router.post("/estoque")
def add_estoque(produto: Produto, token=Security(utils.api_key_scheme)) -> ResProduto:
    auth_token = utils.get_auth(token)
    produto.labels = [label.lower() for label in produto.labels]
    ret_prod = db.add_estoque(produto, auth_token)
    utils.background_job(utils.update_cluster, auth_token, db)
    return ret_prod


@router.get("/estoque/low-stock")
def get_low_stock_estoque(request: Request, token=Security(utils.api_key_scheme)) -> list[ResProduto]:
    auth_token = utils.get_auth(token)
    low_stock_produtos = db.get_low_stock_produtos(auth_token)
    best_describer = ml.return_dict_of_clusterId_with_describer(low_stock_produtos)
    if best_describer is not None:
        for produto in low_stock_produtos:
            b = best_describer.get(produto.cluster_id, "")
            if b != "":
                produto.best_describer = b.lower()
    return low_stock_produtos


@router.get("/categorias")
def get_categorias(request: Request, token=Security(utils.api_key_scheme)) -> list[str]:
    auth_token = utils.get_auth(token)
    categorias = db.get_categorias(auth_token)
    return categorias


@router.get("/estoque/{id}")
def get_produto(
    request: Request, id: str, token=Security(utils.api_key_scheme)
) -> ResProduto:
    auth_token = utils.get_auth(token)
    produto = db.get_produto(id, auth_token)
    return produto


@router.put("/estoque/{id}")
def update_estoque(
    id: str, produto: Produto, token=Security(utils.api_key_scheme)
) -> ResProduto:
    auth_token = utils.get_auth(token)
    produto.labels = [label.lower() for label in produto.labels]
    updated_produto = db.update_estoque(id, produto, auth_token)
    utils.background_job(utils.update_cluster, auth_token, db)
    return updated_produto


@router.delete("/estoque/{id}")
def delete_produto_by_id(id: str, token=Security(utils.api_key_scheme)) -> bool:
    auth_token = utils.get_auth(token)
    deleted = db.delete_produto(id, auth_token)
    utils.background_job(utils.update_cluster, auth_token, db)
    return deleted


@router.get("/health")
def health_check() -> dict:
    return {"status": "ok"}
