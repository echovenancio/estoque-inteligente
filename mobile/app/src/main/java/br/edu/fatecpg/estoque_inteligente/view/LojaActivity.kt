package br.edu.fatecpg.estoque_inteligente.view

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import br.edu.fatecpg.estoque_inteligente.MainActivity
import br.edu.fatecpg.estoque_inteligente.databinding.ActivityLojaBinding

class LojaActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLojaBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLojaBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Botão Voltar para MainActivity
        binding.btnVoltar.setOnClickListener {
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
            finish()
        }
    }
}
