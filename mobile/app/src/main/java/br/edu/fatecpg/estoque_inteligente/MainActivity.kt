package br.edu.fatecpg.estoque_inteligente

import android.animation.AnimatorInflater
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import br.edu.fatecpg.estoque_inteligente.services.ApiAccess
import br.edu.fatecpg.estoque_inteligente.dao.CredDao
import br.edu.fatecpg.estoque_inteligente.databinding.ActivityMainBinding
import br.edu.fatecpg.estoque_inteligente.exceptions.ApiError
import br.edu.fatecpg.estoque_inteligente.model.Login
import br.edu.fatecpg.estoque_inteligente.model.LoginRes
import br.edu.fatecpg.estoque_inteligente.view.FabricaActivity
import br.edu.fatecpg.estoque_inteligente.view.LojaActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        enableEdgeToEdge()
        setContentView(binding.root)

        // Animação Logo girante
        val logoImage = binding.logoImage
        val animator = AnimatorInflater.loadAnimator(this, R.animator.rotate_logo)
        animator.setTarget(logoImage)
        animator.start()

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
                val res: LoginRes = try {
                    api.login(login)
                } catch (e: ApiError.Validation) {
                    e.errors.forEach { println(it.msg) }
                    return@launch
                } catch (e: ApiError.Http) {
                    println("http error ${e.code}: ${e.body}")
                    return@launch
                } catch (e: ApiError) {
                    println("some api err")
                    return@launch
                }

                CredDao().setToken(res.idToken)
                Log.i("login", res.toString())

                withContext(Dispatchers.Main) {
                    when (res.email) {
                        "loja@email.com" -> {
                            startActivity(Intent(this@MainActivity, LojaActivity::class.java))
                            finish()
                        }
                        "fabrica@email.com" -> {
                            startActivity(Intent(this@MainActivity, FabricaActivity::class.java))
                            finish()
                        }
                    }
                }
            }

        }
    }
}
