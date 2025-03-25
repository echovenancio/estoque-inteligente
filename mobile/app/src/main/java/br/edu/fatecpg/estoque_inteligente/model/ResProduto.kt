package br.edu.fatecpg.estoque_inteligente.model

data class ResProduto(
    val id: String,
    val nm_produto: String,
    val quantidade: String,
    val labels: List<String>,
    val created_at: String,
    val updated_at: String,
)
