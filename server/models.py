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
    quantidade: int
    status: str

class ResProduto(BaseModel):
    id: str
    nm_produto: str
    quantidade: int
    status: str
    created_at: str
    updated_at: str

class Login(BaseModel):
    email: str
    password: str
