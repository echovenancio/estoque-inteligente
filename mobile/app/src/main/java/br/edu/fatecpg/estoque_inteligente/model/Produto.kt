package br.edu.fatecpg.estoque_inteligente.model

import kotlinx.serialization.Serializable

@Serializable
data class Produto(
    val nm_produto: String,
    val type_quantidade: String,
    val val_quantidade: Float,
    val labels: List<String>,
    val anotation: String,
)
