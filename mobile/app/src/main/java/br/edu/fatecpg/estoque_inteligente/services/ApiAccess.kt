package br.edu.fatecpg.estoque_inteligente.services

import android.util.Log
import br.edu.fatecpg.estoque_inteligente.BuildConfig
import br.edu.fatecpg.estoque_inteligente.dao.CredDao
import br.edu.fatecpg.estoque_inteligente.exceptions.ApiError
import br.edu.fatecpg.estoque_inteligente.model.Login
import br.edu.fatecpg.estoque_inteligente.model.LoginRes
import br.edu.fatecpg.estoque_inteligente.model.Produto
import br.edu.fatecpg.estoque_inteligente.model.ResProduto
import br.edu.fatecpg.estoque_inteligente.model.ValidationError
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response

class ApiAccess {
    private var api_url = ""
    private var base = "v1"
    private val json_media_type = "application/json; charset=utf-8".toMediaType()

    init {
        api_url = BuildConfig.API_URL
    }

    private suspend fun makeReq(client: OkHttpClient, request: Request): Response {
        return withContext(Dispatchers.IO) {
            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                val body = response.body?.string()
                if (!body.isNullOrBlank()) {
                    try {
                        val err = Json.decodeFromString<ValidationError>(body)
                        throw ApiError.Validation(err.detail)
                    } catch (_: Exception) {
                        throw ApiError.Http(response.code, body)
                    }
                }
                throw ApiError.Unknown
            }
            response
        }
    }


    suspend fun login(login: Login): LoginRes {
        val json = Json.encodeToString(login)
        val requestBody = json.toRequestBody(json_media_type)
        val client = OkHttpClient()
        val request = Request.Builder()
            .url("${api_url}/${base}/login")
            .post(requestBody)
            .build()
        val response = makeReq(client, request)
        Log.i("before", response.message)
        val responseBody = response.body?.string() ?: throw Exception("Deu pau ai")
        Log.i("res", responseBody.toString())
        val loginRes = Json.decodeFromString<LoginRes>(responseBody)
        return loginRes
    }

    suspend fun get_estoque(): List<ResProduto> {
        val client = OkHttpClient()
        val token = CredDao().getToken()
        val request = Request.Builder()
            .url("${api_url}/${base}/estoque")
            .header("Authorization", "Bearer ${token}")
            .get()
            .build()
        val response = makeReq(client, request)
        val responseBody = response.body?.string() ?: throw Exception("Deu pau ai")
        val estoque = Json.decodeFromString<List<ResProduto>>(responseBody)
        return estoque
    }

    suspend fun get_categorias(): List<String> {
        val client = OkHttpClient()
        val token = CredDao().getToken()
        val request = Request.Builder()
            .url("${api_url}/${base}/categorias")
            .header("Authorization", "Bearer ${token}")
            .get()
            .build()
        val response = makeReq(client, request)
        val responseBody = response.body?.string() ?: throw Exception("Deu pau ai")
        val estoque = Json.decodeFromString<List<String>>(responseBody)
        return estoque
    }

    suspend fun get_produto(id: String): ResProduto {
        val client = OkHttpClient()
        val token = CredDao().getToken()
        val request = Request.Builder()
            .url("${api_url}/${base}/estoque/${id}")
            .header("Authorization", "Bearer ${token}")
            .get()
            .build()
        val response = makeReq(client, request)
        val responseBody = response.body?.string() ?: throw Exception("Deu pau ai")
        val produto = Json.decodeFromString<ResProduto>(responseBody)
        return produto
    }

    suspend fun add_produto(produto: Produto): ResProduto {
        val json = Json.encodeToString(produto)
        val requestBody = json.toRequestBody(json_media_type)
        val token = CredDao().getToken() 
        val client = OkHttpClient()
        val request = Request.Builder()
            .url("${api_url}/${base}/estoque")
            .header("Authorization", "Bearer ${token}")
            .post(requestBody)
            .build()
        val response = makeReq(client, request)
        val responseBody = response.body?.string() ?: throw Exception("Deu pau ai")
        val produto = Json.decodeFromString<ResProduto>(responseBody)
        return produto
    }

    suspend fun update_produto(id: String, produto: Produto): ResProduto {
        val json = Json.encodeToString(produto)
        val requestBody = json.toRequestBody(json_media_type)
        val token = CredDao().getToken()
        val client = OkHttpClient()
        val request = Request.Builder()
            .url("${api_url}/${base}/estoque/${id}")
            .header("Authorization", "Bearer ${token}")
            .put(requestBody)
            .build()
        val response = makeReq(client, request)
        val responseBody = response.body?.string() ?: throw Exception("Deu pau ai")
        val produto = Json.decodeFromString<ResProduto>(responseBody)
        return produto
    }
}
