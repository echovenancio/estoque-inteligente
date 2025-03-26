package br.edu.fatecpg.estoque_inteligente.controller

import android.util.Log
import br.edu.fatecpg.estoque_inteligente.BuildConfig
import br.edu.fatecpg.estoque_inteligente.model.Login
import br.edu.fatecpg.estoque_inteligente.model.LoginRes
import com.google.android.gms.common.api.Api.Client
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import okhttp3.Dispatcher
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import io.github.cdimascio.dotenv.Dotenv
import java.io.File
import java.net.URL

class ApiAccess {
    private var api_url = ""
    private val json_media_type = "application/json; charset=utf-8".toMediaType()

    init {
        api_url = BuildConfig.API_URL
    }

    private suspend fun makeReq(client: OkHttpClient, request: Request): Response {
        return withContext(Dispatchers.IO) {
            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                Log.e("api erro", response.toString())
                throw Exception("Erro na api")
                }
            response
        }
    }

    suspend fun login(login: Login): LoginRes {
        val json = Json.encodeToString(login)
        val requestBody = json.toRequestBody(json_media_type)
        val client = OkHttpClient()
        val request = Request.Builder()
            .url("${api_url}/login")
            .post(requestBody)
            .build()
        val response = makeReq(client, request)
        Log.i("before", response.message)
        val responseBody = response.body?.string() ?: throw Exception("Deu pau ai")
        Log.i("res", responseBody.toString())
        val loginRes = Json.decodeFromString<LoginRes>(responseBody)
        return loginRes
    }
}