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
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import br.edu.fatecpg.estoque_inteligente.R
import br.edu.fatecpg.estoque_inteligente.databinding.ActivityFabricaVisualizarProdutoBinding
import br.edu.fatecpg.estoque_inteligente.databinding.ActivityVisualizarProdutoBinding
import br.edu.fatecpg.estoque_inteligente.model.Produto
import br.edu.fatecpg.estoque_inteligente.services.ApiAccess
import br.edu.fatecpg.estoque_inteligente.utils.ColorsProvider
import kotlinx.coroutines.launch

class FabricaVisualizarProduto : AppCompatActivity() {
    private lateinit var binding: ActivityFabricaVisualizarProdutoBinding
    private val colorsProvider = ColorsProvider()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityFabricaVisualizarProdutoBinding.inflate(layoutInflater)
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
