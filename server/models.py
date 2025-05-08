from pydantic import BaseModel

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
    nm_produto: str
    type_quantidade: str
    val_quantidade: float
    labels: list[str]
    anotation: str

class ResProduto(BaseModel):
    id: str
    nm_produto: str
    type_quantidade: str
    val_quantidade: float
    labels: list[str]
    anotation: str
    cluster_id: int
    created_at: str
    updated_at: str

class Login(BaseModel):
    email: str
    password: str
