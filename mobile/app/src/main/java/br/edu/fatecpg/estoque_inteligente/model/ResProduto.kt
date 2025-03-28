package br.edu.fatecpg.estoque_inteligente.model

import kotlinx.serialization.Serializable

@Serializable
data class ResProduto(
    val id: String,
    val nm_produto: String,
    val quantidade: Int,
    val labels: List<String>,
    val anotation: String,
    val cluster_id: Int,
    val created_at: String,
    val updated_at: String,
)
