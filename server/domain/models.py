from pydantic import BaseModel, Field
from typing import Literal

class LoginRes(BaseModel):
    kind: str
    localId: str
    email: str
    displayName: str
    idToken: str
    registered: bool
    refreshToken: str
    expiresIn: str

class Produto(BaseModel):
    nm_produto: str = Field(min_length=1, max_length=100, description="Nome do produto")
    type_quantidade: str = Field(min_length=2, max_length=2, description="Tipo da quantidade, UN para uninade KG para kilograma, GR para pramas, LT para litros, ML para milimetros.")
    val_quantidade: float = Field(default=0.0, description="Valor da quantidade do produto")
    labels: list[str] = Field(default=[], description="Lista de categorias que descrevem o produto")
    anotation: str = Field(default="", description="Descrição do produto")

class ResProduto(BaseModel):
    id: str
    nm_produto: str
    type_quantidade: Literal["gr", "lt", "un", "kg", "ml"]
    val_quantidade: float
    labels: list[str]
    anotation: str
    cluster_id: int
    created_at: str
    updated_at: str
    best_describer: str = ""

class Login(BaseModel):
    email: str = Field(min_length=1, max_length=300, description="Email do usuário cadastrado no sistema")
    password: str = Field(min_length=1, max_length=300, description="Senha do usuário cadastrado no sistema")
