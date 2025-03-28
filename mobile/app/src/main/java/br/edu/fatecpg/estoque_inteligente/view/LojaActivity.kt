package br.edu.fatecpg.estoque_inteligente.view

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import br.edu.fatecpg.estoque_inteligente.MainActivity
import br.edu.fatecpg.estoque_inteligente.controller.ApiAccess
import br.edu.fatecpg.estoque_inteligente.databinding.ActivityLojaBinding
import br.edu.fatecpg.estoque_inteligente.model.Produto
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

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
