package br.edu.fatecpg.estoque_inteligente.view
import android.animation.AnimatorInflater
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
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
import br.edu.fatecpg.estoque_inteligente.utils.ColorsProvider
import kotlinx.coroutines.launch

class AddProdutos : AppCompatActivity() {
    private lateinit var binding: ActivityEditarProdutosBinding
    private val colorsProvider = ColorsProvider()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEditarProdutosBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // animação logo girante
        val logoImage = binding.logoImage
        val animator = AnimatorInflater.loadAnimator(this, R.animator.rotate_logo)
        animator.setTarget(logoImage)
        animator.start()

        val unidades = listOf("gr", "lt", "un", "kg", "ml")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, unidades)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.referencia.adapter = adapter

        binding.btnVoltar2.setOnClickListener {
            val intent = Intent(this, LojaActivity::class.java)
            startActivity(intent)
            finish()
        }

        val inflater = LayoutInflater.from(this)
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
