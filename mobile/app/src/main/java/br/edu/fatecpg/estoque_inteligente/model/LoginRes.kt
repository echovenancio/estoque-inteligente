package br.edu.fatecpg.estoque_inteligente.model

import kotlinx.serialization.Serializable

@Serializable
data class LoginRes(
    val kind: String,
    val localId: String,
    val email: String,
    val displayName: String,
    val idToken: String,
    val registered: Boolean,
    val refreshToken: String,
    val expiresIn: String
)

