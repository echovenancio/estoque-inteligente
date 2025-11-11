from abc import ABC, abstractmethod
from domain.models import LoginRes, ResProduto, Produto


class GenericDBManager(ABC):
    @abstractmethod
    def login(self, email, password) -> LoginRes:
        pass

    @abstractmethod
    def get_estoque(self, auth_token) -> list[ResProduto]:
        pass

    @abstractmethod
    def get_produto(self, id, auth_token) -> ResProduto:
        pass

    @abstractmethod
    def add_estoque(self, produto, auth_token) -> ResProduto:
        pass

    @abstractmethod
    def update_estoque(self, id, produto, auth_token) -> ResProduto:
        pass

    @abstractmethod
    def get_categorias(self, auth_token) -> list[str]:
        pass

    @abstractmethod
    def get_estoque_size(self, auth_token) -> int:
        pass

    @abstractmethod
    def update_cluster(self, id, cluster_id, auth_token):
        pass

    @abstractmethod
    def delete_produto(self, id, auth_token) -> bool:
        pass

    @abstractmethod
    def get_low_stock_produtos(self, auth_token) -> list[ResProduto]:
        pass
