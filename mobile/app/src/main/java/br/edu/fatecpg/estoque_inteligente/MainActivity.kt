package br.edu.fatecpg.estoque_inteligente

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import br.edu.fatecpg.estoque_inteligente.controller.ApiAccess
import br.edu.fatecpg.estoque_inteligente.dao.CredDao
import br.edu.fatecpg.estoque_inteligente.databinding.ActivityMainBinding
import br.edu.fatecpg.estoque_inteligente.model.Login
import br.edu.fatecpg.estoque_inteligente.view.FabricaActivity
import br.edu.fatecpg.estoque_inteligente.view.LojaActivity
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        enableEdgeToEdge()
        setContentView(binding.root)

        // Botão de Login
        binding.btnLogin.setOnClickListener {
            val email = binding.edtEmail.text.toString().trim()
            val senha = binding.edtSenha.text.toString().trim()

            // Verifica se os campos estão preenchidos
            if (email.isEmpty() || senha.isEmpty()) {
                Toast.makeText(this, "Erro! Preencha todos os campos!", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val api = ApiAccess()
            val login = Login(email, senha)
            lifecycleScope.launch(Dispatchers.IO) {
                val res = api.login(login)
                val credDao = CredDao()
                credDao.setToken(res.idToken)
                Log.i("login", res.toString())

                withContext(Dispatchers.Main) {
                    if (res.email.equals("loja@email.com")) {
                        startActivity(Intent(this@MainActivity, LojaActivity::class.java))
                        finish()
                    } else if (res.email.equals("fabrica@email.com")) {
                        startActivity(Intent(this@MainActivity, FabricaActivity::class.java))
                        finish()
                    }
                }
            }
        }
    }
}
