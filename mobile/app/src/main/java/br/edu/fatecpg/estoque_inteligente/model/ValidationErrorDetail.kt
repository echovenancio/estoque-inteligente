package br.edu.fatecpg.estoque_inteligente.model

data class ValidationErrorDetail(
    val loc: List<String>,
    val msg: String,
    val type: String
)
