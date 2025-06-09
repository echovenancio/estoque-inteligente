package br.edu.fatecpg.estoque_inteligente.view
import android.animation.AnimatorInflater
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.inputmethod.InputMethodManager
import android.widget.ArrayAdapter
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import br.edu.fatecpg.estoque_inteligente.R
import br.edu.fatecpg.estoque_inteligente.databinding.ActivityEditarProdutosBinding
import br.edu.fatecpg.estoque_inteligente.model.Produto
import br.edu.fatecpg.estoque_inteligente.services.ApiAccess
import kotlinx.coroutines.launch

class AddProdutos : AppCompatActivity() {
    private lateinit var binding: ActivityEditarProdutosBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEditarProdutosBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Animação Logo girante
        val logoImage = binding.logoImage
        val animator = AnimatorInflater.loadAnimator(this, R.animator.rotate_logo)
        animator.setTarget(logoImage)
        animator.start()

        val unidades = listOf("gr", "lt", "un", "kg", "ml")

        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, unidades)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)

        binding.referencia.adapter = adapter
        val unidadeSelecionada = binding.referencia.selectedItem.toString()

        binding.btnVoltar2.setOnClickListener {
            val intent = Intent(this, LojaActivity::class.java)
            startActivity(intent)
            finish()
        }

        binding.btnAddsabor.setOnClickListener{
            val inflater = LayoutInflater.from(this)
            val view = inflater.inflate(R.layout.item_sabor_editavel, null)

            val edtSabor = view.findViewById<EditText>(R.id.edtSabor)

            edtSabor.requestFocus()
            binding.saboresSelecionados.addView(view)

            // Mostra o teclado automaticamente
            val imm = getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager
            imm.showSoftInput(edtSabor, InputMethodManager.SHOW_IMPLICIT)
        }

        binding.btnCadastrar.setOnClickListener {
            lifecycleScope.launch {
                try {
                    val nome = binding.nomeproduto.text.toString().trim()
                    val quantidadeTexto = binding.campoQuantidade.text.toString().trim()
                    val quantidade = quantidadeTexto.toFloatOrNull() ?: 0f
                    val tipoQuantidade = binding.referencia.selectedItem.toString()
                    val anotacao = binding.campoanotacoes.text.toString().trim()

                    val sabores = mutableListOf<String>()
                    for (i in 0 until binding.saboresSelecionados.childCount) {
                        val view = binding.saboresSelecionados.getChildAt(i)
                        val edt = view.findViewById<EditText>(R.id.edtSabor)
                        edt?.text?.toString()?.trim()?.let {
                            if (it.isNotEmpty()) sabores.add(it)
                        }
                    }

                    val produto = Produto(
                        nm_produto = nome,
                        type_quantidade = tipoQuantidade,
                        val_quantidade = quantidade,
                        labels = sabores,
                        anotation = anotacao
                    )
                    val api = ApiAccess()
                    val response = api.add_produto(produto)
                    Toast.makeText(this@AddProdutos, "Produto cadastrado!", Toast.LENGTH_SHORT).show()
                    val intent = Intent(this@AddProdutos, LojaActivity::class.java)
                    startActivity(intent)
                    finish()

                } catch (e: Exception) {
                    e.printStackTrace()
                    Toast.makeText(this@AddProdutos, "Erro: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}