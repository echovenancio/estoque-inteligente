import threading

from fastapi.security.api_key import APIKeyHeader

from database.generic_repository import GenericDBManager
from domain.exceptions import Unauthorized

import ml

def background_job(func, *args):
    t = threading.Thread(target=func, args=args)
    t.daemon = True
    t.start()

def update_cluster(auth_token: str, db: GenericDBManager):
    print("Token for update cluster:", auth_token)
    produtos = db.get_estoque(auth_token)
    print(f"Updating cluster for {len(produtos)} products")
    if len(produtos) == 0:
        print("No products to update cluster.")
        return
    updated_cluster_id = ml.fit_model(produtos, max(1, int(len(produtos) / 3)))
    print(f"Updated cluster IDs: {updated_cluster_id}")
    for produto, cluster_id in zip(produtos, updated_cluster_id):
        db.update_cluster(produto.id, int(cluster_id), auth_token)

def get_auth(token) -> str:
    if not token or not token.startswith("Bearer "):
        raise Unauthorized()
    return token.split(" ")[1]

api_key_scheme = APIKeyHeader(name="Authorization", auto_error=False)
