package br.edu.fatecpg.estoque_inteligente.view
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
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
import br.edu.fatecpg.estoque_inteligente.utils.ColorsProvider

class VisualizarProduto : AppCompatActivity() {
    private lateinit var binding: ActivityVisualizarProdutoBinding
    private val colorsProvider = ColorsProvider()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityVisualizarProdutoBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val produtoId = intent.getStringExtra("produtoId") ?: ""
        val nome = intent.getStringExtra("nome") ?: "Produto sem nome"
        val labels = intent.getStringArrayExtra("labels")?.toList() ?: emptyList()
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

        val inflater = LayoutInflater.from(this)
        binding.saboresSelecionados.removeAllViews()
        for (sabor in labels) {
            val view = inflater.inflate(R.layout.item_sabor_editavel, binding.saboresSelecionados, false)
            val edtSabor = view.findViewById<EditText>(R.id.edtSabor)
            edtSabor.setText(sabor)
            applyColorsToEditText(edtSabor, sabor, colorsProvider)
            binding.saboresSelecionados.addView(view)
        }

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

            val api = ApiAccess()
            lifecycleScope.launch {
                try {
                    api.update_produto(produtoId, produtoAtualizado)
                    Toast.makeText(this@VisualizarProduto, "Produto cadastrado!", Toast.LENGTH_SHORT).show()
                    toggleEditable(false)
                    binding.btnSalvarproduto.visibility = View.GONE
                    binding.btnEditarproduto.visibility = View.VISIBLE
                } catch (e: Exception) {
                    Toast.makeText(this@VisualizarProduto, "Erro ao atualizar: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }

        binding.btnApagar.setOnClickListener {
            val api = ApiAccess()
            lifecycleScope.launch {
                try {
                    api.delete_produto(produtoId)
                    Toast.makeText(this@VisualizarProduto, "Produto excluido!", Toast.LENGTH_SHORT).show()
                    toggleEditable(false)
                    binding.btnSalvarproduto.visibility = View.GONE
                    binding.btnEditarproduto.visibility = View.VISIBLE
                    val intent = Intent(this@VisualizarProduto, LojaActivity::class.java)
                    startActivity(intent)
                    finish()
                } catch (e: Exception) {
                    Toast.makeText(this@VisualizarProduto, "Erro ao excluir: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }

        binding.btnAddsabor.setOnClickListener {
            val view = inflater.inflate(R.layout.item_sabor_editavel, binding.saboresSelecionados, false)
            val edtSabor = view.findViewById<EditText>(R.id.edtSabor)
            edtSabor.requestFocus()

            edtSabor.setOnFocusChangeListener { _, hasFocus ->
                if (!hasFocus && edtSabor.text.toString().trim().isEmpty()) {
                    val imm = getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager
                    imm.hideSoftInputFromWindow(edtSabor.windowToken, 0)
                    binding.saboresSelecionados.removeView(view)
                }
            }

            applyColorsToEditText(edtSabor, "", colorsProvider)

            edtSabor.addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                    applyColorsToEditText(edtSabor, s?.toString() ?: "", colorsProvider)
                }
                override fun afterTextChanged(s: Editable?) {}
            })

            val btnAddIndex = binding.saboresSelecionados.indexOfChild(binding.btnAddsabor)
            if (btnAddIndex == -1) {
                // fallback, just add at the end if not found for some reason
                binding.saboresSelecionados.addView(view)
            } else {
                binding.saboresSelecionados.addView(view, btnAddIndex)
            }

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
        binding.referencia.isFocusableInTouchMode = enabled  // add this

        binding.campoanotacoes.isEnabled = enabled
        binding.campoanotacoes.isFocusable = enabled
        binding.campoanotacoes.isFocusableInTouchMode = enabled

        binding.btnAddsabor.visibility = if (enabled) View.VISIBLE else View.GONE
        binding.btnApagar.visibility = if (enabled) View.VISIBLE else View.GONE

        binding.scrollContent.descendantFocusability =
            if (enabled) ViewGroup.FOCUS_AFTER_DESCENDANTS else ViewGroup.FOCUS_BLOCK_DESCENDANTS
    }


    private fun applyColorsToEditText(edt: EditText, input: String, colorsProvider: ColorsProvider) {
        val container = edt.parent as View
        val background = container.background.mutate() as GradientDrawable

        val (bg, fg) = colorsProvider.stringToThemeColors(input)
        val bgColor = Color.rgb(bg.red, bg.green, bg.blue)
        val fgColor = Color.rgb(fg.red, fg.green, fg.blue)

        background.setColor(bgColor)
        container.background = background

        edt.setTextColor(fgColor)
    }
}

