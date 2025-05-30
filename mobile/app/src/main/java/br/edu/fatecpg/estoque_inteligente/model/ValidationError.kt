package br.edu.fatecpg.estoque_inteligente.model

import kotlinx.serialization.Serializable

@Serializable
data class ValidationError(
    val detail: List<ValidationErrorDetail>
)