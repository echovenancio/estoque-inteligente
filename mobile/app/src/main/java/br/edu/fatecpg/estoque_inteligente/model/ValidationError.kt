package br.edu.fatecpg.estoque_inteligente.model

data class ValidationError(
    val detail: List<ValidationErrorDetail>
)