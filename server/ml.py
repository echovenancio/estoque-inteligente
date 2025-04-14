import os
import joblib
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from database import get_db_manager
from models import Produto, ResProduto

# Initialize database manager
db = get_db_manager()

# Stopwords for Portuguese
stopwords_pt = ["de", "em", "a", "o", "para", "com", "e", "os", "as"]

# Global variable for the model
model: KMeans = None

def save_model(model: KMeans, model_path: str = 'model.pkl'):
    joblib.dump(model, model_path)

def load_model(model_path: str = 'model.pkl') -> KMeans:
    if os.path.exists(model_path):
        return joblib.load(model_path)
    return None

def model_need_refit(estoque_size: int, model: KMeans) -> bool:
    if model is None:
        return True
    cluster_estimate = max(1, int(estoque_size / 5))
    return cluster_estimate != len(model.cluster_centers_)

def document_from_produto(produto: ResProduto) -> str:
    doc = f"{produto.nm_produto} {produto.anotation} {' '.join(produto.labels)}"
    return doc

def return_clustered_row(produto: Produto, model: KMeans) -> int:
    doc = document_from_produto(produto)
    vectorizer = TfidfVectorizer(stop_words=stopwords_pt)
    X = vectorizer.fit_transform([doc])
    return model.predict(X)[0]

def return_clustered_data(lista_produtos: list[Produto], model: KMeans) -> pd.DataFrame:
    docs = [document_from_produto(produto) for produto in lista_produtos]
    vectorizer = TfidfVectorizer(stop_words=stopwords_pt)
    X = vectorizer.fit_transform(docs)
    clustered_data = model.predict(X)
    return pd.DataFrame({'Produto': lista_produtos, 'Cluster': clustered_data})

def fit_model(lista_produtos: list[ResProduto], n_clusters: int) -> KMeans:
    docs = [document_from_produto(produto) for produto in lista_produtos]
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(docs)
    model = KMeans(n_clusters=n_clusters, random_state=42)
    model.fit(X)
    save_model(model)
    return model.predict(X)

model = load_model()
