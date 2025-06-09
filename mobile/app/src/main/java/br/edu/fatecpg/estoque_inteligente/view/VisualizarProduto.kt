package br.edu.fatecpg.estoque_inteligente.view
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import br.edu.fatecpg.estoque_inteligente.databinding.ActivityVisualizarProdutoBinding

class VisualizarProduto : AppCompatActivity() {
    private lateinit var binding: ActivityVisualizarProdutoBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityVisualizarProdutoBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val nome = intent.getStringExtra("nome") ?: "Produto sem nome"
        val qtd = intent.getStringExtra("quantidade") ?: "-"
        val ref = intent.getStringExtra("referencia") ?: "-"
        val notas = intent.getStringExtra("anotacoes") ?: "Sem anotações"

        binding.nomeproduto.setText(nome)
        binding.campoQuantidade.setText(qtd)
        val adapter = binding.referencia.adapter
        for (i in 0 until adapter.count) {
            if (adapter.getItem(i).toString().equals(ref, ignoreCase = true)) {
                binding.referencia.setSelection(i)
                break
            }
        }
        binding.campoanotacoes.setText(notas)

        binding.btnVoltarVisualizar.setOnClickListener {
            finish()
        }
    }
}