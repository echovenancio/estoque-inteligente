package br.edu.fatecpg.estoque_inteligente.model

data class Produto(
    val nm_produto: String,
    val quantidade: String,
    val labels: List<String>,
    val anotation: String,
)
