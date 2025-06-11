package br.edu.fatecpg.estoque_inteligente.model

import kotlinx.serialization.Serializable

@Serializable
data class ResProduto(
    val id: String,
    val nm_produto: String,
    val type_quantidade: String,
    val val_quantidade: Float,
    val labels: List<String>,
    val best_describer: String,
    val anotation: String,
    val cluster_id: Int,
    val created_at: String,
    val updated_at: String,
)
