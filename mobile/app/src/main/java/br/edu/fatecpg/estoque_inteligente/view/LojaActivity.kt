package br.edu.fatecpg.estoque_inteligente.view

import android.animation.AnimatorInflater
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SearchView
import androidx.core.widget.addTextChangedListener
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import br.edu.fatecpg.estoque_inteligente.MainActivity
import br.edu.fatecpg.estoque_inteligente.R
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

    override fun onResume() {
        super.onResume()
        carregarProdutos()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLojaBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Animação Logo girante
        val logoImage = binding.logoImage
        val animator = AnimatorInflater.loadAnimator(this, R.animator.rotate_logo)
        animator.setTarget(logoImage)
        animator.start()

//         Botão Voltar para MainActivity
        binding.button.setOnClickListener {
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
            finish()
        }

        binding.btnAddproduto.setOnClickListener {
            val intent = Intent(this, AddProdutos::class.java)
            startActivity(intent)
            finish()
        }


        // Configura RecyclerView
        binding.recyclerView.layoutManager = LinearLayoutManager(this)
        produtoAdapter = ProdutoAdapter(emptyList()) { produto ->
            val intent = Intent(this, VisualizarProduto::class.java).apply {
                putExtra("produtoId", produto.id)
                putExtra("nome", produto.nm_produto)
                putExtra("labels", produto.labels.toTypedArray())
                putExtra("quantidade", "${produto.val_quantidade} ${produto.type_quantidade ?: ""}")
                putExtra("referencia", produto.type_quantidade)
                putExtra("anotacoes", produto.anotation ?: "Sem anotações")
            }
            startActivity(intent)
        }
        binding.recyclerView.adapter = produtoAdapter

        // Carregar dados dos produtos
//
        binding.search.addTextChangedListener { editable ->
            val textoDigitado = editable.toString()
            produtoAdapter.filtrar(textoDigitado)
        }
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