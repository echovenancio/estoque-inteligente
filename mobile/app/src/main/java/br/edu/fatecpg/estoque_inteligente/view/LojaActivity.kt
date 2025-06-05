package br.edu.fatecpg.estoque_inteligente.view

import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import br.edu.fatecpg.estoque_inteligente.adapter.ProdutoAdapter
import br.edu.fatecpg.estoque_inteligente.services.ApiAccess
import br.edu.fatecpg.estoque_inteligente.databinding.ActivityLojaBinding
import br.edu.fatecpg.estoque_inteligente.model.ResProduto
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class LojaActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLojaBinding
    private lateinit var produtoAdapter: ProdutoAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLojaBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Botão Voltar para MainActivity
//        binding.btnVoltar.setOnClickListener {
//            val intent = Intent(this, MainActivity::class.java)
//            startActivity(intent)
//            finish()
//        }

        // Configura RecyclerView
        binding.recyclerView.layoutManager = LinearLayoutManager(this)
        produtoAdapter = ProdutoAdapter(emptyList()) // Inicializa com lista vazia
        binding.recyclerView.adapter = produtoAdapter

        // Carregar dados dos produtos
        carregarProdutos()

//        binding.search.setOnQueryTextListener(object : androidx.appcompat.widget.SearchView.OnQueryTextListener {
//            override fun onQueryTextSubmit(query: String?): Boolean {
//                return false
//            }
//
//            override fun onQueryTextChange(newText: String?): Boolean {
//                newText?.let { produtoAdapter.filtrar(it) }
//                return true
//            }
//        })

    }

    private fun carregarProdutos() {
        lifecycleScope.launch(Dispatchers.IO) {
            val api = ApiAccess()
            try {
                val produtos: List<ResProduto> = api.get_estoque()

                //verificar a resposta da API no logcat
                Log.d("API_RESPONSE", "Produtos recebidos: $produtos")

                withContext(Dispatchers.Main) {
                    if (produtos.isNotEmpty()) {
                        produtoAdapter.atualizarLista(produtos)

                        // Logcat para confirmar que o RecyclerView foi atualizado
                        Log.d("UI_UPDATE", "RecyclerView atualizado com ${produtos.size} produtos")
                    } else {
                        Log.d("API_RESPONSE", "Nenhum produto recebido")
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@LojaActivity, "Erro ao carregar produtos", Toast.LENGTH_SHORT).show()
                }
                Log.e("API_ERROR", "Erro ao carregar produtos", e)
            }
        }
    }

}