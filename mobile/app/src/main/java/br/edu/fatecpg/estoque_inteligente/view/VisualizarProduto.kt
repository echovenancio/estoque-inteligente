package br.edu.fatecpg.estoque_inteligente.view
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.ArrayAdapter
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import br.edu.fatecpg.estoque_inteligente.R
import br.edu.fatecpg.estoque_inteligente.databinding.ActivityVisualizarProdutoBinding
import br.edu.fatecpg.estoque_inteligente.model.Produto
import br.edu.fatecpg.estoque_inteligente.services.ApiAccess
import kotlinx.coroutines.launch

class VisualizarProduto : AppCompatActivity() {
    private lateinit var binding: ActivityVisualizarProdutoBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityVisualizarProdutoBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val produtoId = intent.getStringExtra("produtoId") ?: ""
        val nome = intent.getStringExtra("nome") ?: "Produto sem nome"
        val qtd = intent.getStringExtra("quantidade") ?: "-"
        val referenciaSelecionada = intent.getStringExtra("referencia") ?: "-"
        val notas = intent.getStringExtra("anotacoes") ?: "Sem anotações"

        binding.nomeproduto.setText(nome)
        binding.campoQuantidade.setText(qtd)

        val unidades = listOf("gr", "lt", "un", "kg", "ml")
        val spinnerAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, unidades)
        spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.referencia.adapter = spinnerAdapter

        val idx = unidades.indexOfFirst { it.equals(referenciaSelecionada, ignoreCase = true) }
        if (idx != -1) binding.referencia.setSelection(idx)

        binding.campoanotacoes.setText(notas)

        toggleEditable(false)

        binding.btnEditarproduto.setOnClickListener {
            toggleEditable(true)
            binding.btnEditarproduto.visibility = View.GONE
            binding.btnSalvarproduto.visibility = View.VISIBLE
        }

        binding.btnSalvarproduto.setOnClickListener {
            val nomeAtualizado = binding.nomeproduto.text.toString()
            val quantidadeAtualizada = binding.campoQuantidade.text.toString()
            val referenciaAtualizada = binding.referencia.selectedItem.toString()
            val anotacoesAtualizadas = binding.campoanotacoes.text.toString()

            val sabores = mutableListOf<String>()
            for (i in 0 until binding.saboresSelecionados.childCount) {
                val view = binding.saboresSelecionados.getChildAt(i)
                val edt = view.findViewById<EditText>(R.id.edtSabor)
                edt?.text?.toString()?.trim()?.let {
                    if (it.isNotEmpty()) sabores.add(it)
                }
            }

            val produtoAtualizado = Produto(
                nm_produto = nomeAtualizado,
                val_quantidade = quantidadeAtualizada.toFloatOrNull() ?: 0.0f,
                type_quantidade = referenciaAtualizada,
                anotation = anotacoesAtualizadas,
                labels = sabores
            )

            // assuming you have the id of the produto somewhere, e.g. produtoId variable
            val api = ApiAccess()
            lifecycleScope.launch {
                try {
                    val updatedProduto = api.update_produto(produtoId, produtoAtualizado)
                    Toast.makeText(this@VisualizarProduto, "Produto cadastrado!", Toast.LENGTH_SHORT).show()
                    // handle success, update UI if needed
                    toggleEditable(false)
                    binding.btnSalvarproduto.visibility = View.GONE
                    binding.btnEditarproduto.visibility = View.VISIBLE
                } catch (e: Exception) {
                    Toast.makeText(this@VisualizarProduto, "Erro ao atualizar: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }

        // btn add sabor click listener
        binding.btnAddsabor.setOnClickListener {
            val inflater = LayoutInflater.from(this)
            val view = inflater.inflate(R.layout.item_sabor_editavel, binding.saboresSelecionados, false)
            val edtSabor = view.findViewById<EditText>(R.id.edtSabor)

            edtSabor.requestFocus()
            binding.saboresSelecionados.addView(view)

            // Mostra o teclado automaticamente
            val imm = getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager
            imm.showSoftInput(edtSabor, InputMethodManager.SHOW_IMPLICIT)
        }

        binding.btnVoltarVisualizar.setOnClickListener {
            finish()
        }
    }


    private fun toggleEditable(enabled: Boolean) {
        binding.nomeproduto.isEnabled = enabled
        binding.nomeproduto.isFocusable = enabled
        binding.nomeproduto.isFocusableInTouchMode = enabled

        binding.campoQuantidade.isEnabled = enabled
        binding.campoQuantidade.isFocusable = enabled
        binding.campoQuantidade.isFocusableInTouchMode = enabled

        binding.referencia.isEnabled = enabled
        binding.referencia.isClickable = enabled
        binding.referencia.isFocusable = enabled

        binding.campoanotacoes.isEnabled = enabled
        binding.campoanotacoes.isFocusable = enabled
        binding.campoanotacoes.isFocusableInTouchMode = enabled

        binding.btnAddsabor.visibility = if (enabled) View.VISIBLE else View.GONE
    }
}