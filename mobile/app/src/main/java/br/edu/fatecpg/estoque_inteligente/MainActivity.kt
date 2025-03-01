package br.edu.fatecpg.estoque_inteligente

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import br.edu.fatecpg.estoque_inteligente.databinding.ActivityMainBinding
import br.edu.fatecpg.estoque_inteligente.view.FabricaActivity
import br.edu.fatecpg.estoque_inteligente.view.LojaActivity
import com.google.firebase.auth.FirebaseAuth

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var auth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        enableEdgeToEdge()
        setContentView(binding.root)

        auth = FirebaseAuth.getInstance()

        // Botão de Login
        binding.btnLogin.setOnClickListener {
            val email = binding.edtEmail.text.toString().trim()
            val senha = binding.edtSenha.text.toString().trim()

            // Verifica se os campos estão preenchidos
            if (email.isEmpty() || senha.isEmpty()) {
                Toast.makeText(this, "Erro! Preencha todos os campos!", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Autenticação no Firebase
            auth.signInWithEmailAndPassword(email, senha)
                .addOnSuccessListener {
                    when (email) {
                        "loja@email.com" -> {
                            startActivity(Intent(this, LojaActivity::class.java))
                            finish()
                        }
                        "fabrica@email.com" -> {
                            startActivity(Intent(this, FabricaActivity::class.java))
                            finish()
                        }
                        else -> {
                            Toast.makeText(this, "Usuário não autorizado!", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
                .addOnFailureListener {
                    Toast.makeText(this, "Falha no login: ${it.message}", Toast.LENGTH_SHORT).show()
                    println(it.message)
                }
        }
    }
}
