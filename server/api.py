from fastapi import FastAPI
from database import DBManager
from pydantic import BaseModel

app = FastAPI()
db = DBManager()

class Produto(BaseModel):
    nm_produto: str
    qt: int

class ResProduto(BaseModel):
    id: int
    nm_produto: str
    qt: int


def map_produto(row) -> ResProduto:
    return ResProduto(id=row[0], nm_produto=row[1], qt=row[2])

@app.get("/estoque")
def estoque() -> list[ResProduto]:
    estoque = db.get_estoque()
    return [map_produto(row) for row in estoque]

@app.get("/estoque/{id}")
def get_produto(id: int) -> ResProduto:
    row = db.get_produto(id)
    return map_produto(row)

@app.post("/estoque")
def add_estoque(produto: Produto) -> dict:
    id = db.add_estoque(produto.nm_produto, produto.qt)
    return {"id": id}

@app.put("/estoque/{id}")
def update_estoque(produto: Produto, id: int) -> dict:
    rowcount = db.update_estoque(id, produto.qt)
    return {"rowcount": rowcount}

@app.get("/")
def root():
    return {"Hello": "World"}
