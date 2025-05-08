from models import ResProduto
import json

def map_product_to_response(row) -> ResProduto:
    """
    Maps a database row to a ResProduto object.
    
    Args:
        row: A tuple representing a row from the database.
        
    Returns:
        An instance of ResProduto with the mapped values.
    """
    return ResProduto(
        id = row[0],
        nm_produto = row[1],
        type_quantidade = row[2],
        val_quantidade = row[3],
        labels = json.loads(row[4]),
        anotation = row[5],
        cluster_id = row[6],
        created_at = str(row[7]),
        updated_at = str(row[8])
    )
