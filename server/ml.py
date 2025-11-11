from collections import defaultdict
import numpy as np
import os
import joblib
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from database.manager_getter import get_db_manager
from domain.models import Produto, ResProduto

# Initialize database manager
db = get_db_manager()

# Stopwords for Portuguese
stopwords_pt = ["de", "em", "a", "o", "para", "com", "e", "os", "as"]

# Global variable for the model
model: KMeans = KMeans()


def model_need_refit(estoque_size: int, model: KMeans) -> bool:
    if model is None:
        return True
    cluster_estimate = max(1, int(estoque_size / 3))
    return cluster_estimate != len(model.cluster_centers_)


def document_from_produto(produto: ResProduto) -> str:
    doc = f"{produto.nm_produto} {' '.join(produto.labels)}"
    return doc


def return_clustered_row(produto: ResProduto, model: KMeans) -> int:
    doc = document_from_produto(produto)
    vectorizer = TfidfVectorizer(stop_words=stopwords_pt)
    X = vectorizer.fit_transform([doc])
    return model.predict(X)[0]


def return_clustered_data(
    lista_produtos: list[ResProduto], model: KMeans
) -> pd.DataFrame:
    docs = [document_from_produto(produto) for produto in lista_produtos]
    vectorizer = TfidfVectorizer(stop_words=stopwords_pt, lowercase=True)
    X = vectorizer.fit_transform(docs)
    clustered_data = model.predict(X)
    return pd.DataFrame({"Produto": lista_produtos, "Cluster": clustered_data})


def fit_model(lista_produtos: list[ResProduto], n_clusters: int):
    docs = [document_from_produto(produto) for produto in lista_produtos]
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(docs)
    model = KMeans(n_clusters=n_clusters, random_state=42)
    model.fit(X)
    return model.predict(X)


# Function to return a dictionary of cluster IDs with their descriptions
# The descriptions are the value in the vectorizer of that cluster that has the
# biggest sum of it's components


def return_dict_of_clusterId_with_describer(lista_produtos: list[ResProduto]) -> dict:
    if len(lista_produtos) == 0:
        return None
    docs = [document_from_produto(produto) for produto in lista_produtos]
    cluster_ids = [produto.cluster_id for produto in lista_produtos]

    vectorizer = TfidfVectorizer(stop_words=stopwords_pt, lowercase=True)
    X = vectorizer.fit_transform(docs)
    feature_names = vectorizer.get_feature_names_out()

    cluster_to_indices = defaultdict(list)
    for idx, cluster_id in enumerate(cluster_ids):
        cluster_to_indices[cluster_id].append(idx)

    best_descriptions = {}
    for cluster_id, indices in cluster_to_indices.items():
        cluster_matrix = X[indices]
        tfidf_sum = np.asarray(cluster_matrix.sum(axis=0)).ravel()
        top_word_index = tfidf_sum.argmax()
        best_word = feature_names[top_word_index]
        best_descriptions[cluster_id] = best_word

    return best_descriptions
