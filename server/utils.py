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


def get_auth(token) -> dict:
    if not token or not token.startswith("Bearer "):
        raise Unauthorized()
    
    token_str = token.split(" ")[1]
    
    # Dev/Mock token handling
    if token_str.startswith("faketoken:"):
        email = token_str.split(":", 1)[1]
        return {"email": email}
    
    # Fallback for legacy/simple tests
    if token_str == "faketoken":
        return {"email": "loja@email.com"}

    # In a real app, verify JWT here
    return {"email": "loja@email.com"}


api_key_scheme = APIKeyHeader(name="Authorization", auto_error=False)
