package br.edu.fatecpg.estoque_inteligente.exceptions

import br.edu.fatecpg.estoque_inteligente.model.ValidationErrorDetail

sealed class ApiError : Exception() {
    data class Validation(val errors: List<ValidationErrorDetail>) : ApiError()
    data class Http(val code: Int, val body: String?) : ApiError()
    object Unknown : ApiError()
}