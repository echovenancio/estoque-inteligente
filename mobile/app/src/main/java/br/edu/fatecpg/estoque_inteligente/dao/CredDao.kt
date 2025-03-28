package br.edu.fatecpg.estoque_inteligente.dao

class CredDao() {
    companion object {
        var token = ""
    }

    fun setToken(tk: String) {
        token = tk
    }

    fun getToken(): String {
        return token
    }
}
