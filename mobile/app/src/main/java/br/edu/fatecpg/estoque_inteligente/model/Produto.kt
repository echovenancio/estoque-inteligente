package br.edu.fatecpg.estoque_inteligente.model

import kotlinx.serialization.Serializable

@Serializable
data class Produto(
    val nm_produto: String,
    val quantidade: Int,
    val labels: List<String>,
    val anotation: String,
)
