package br.edu.fatecpg.estoque_inteligente.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import br.edu.fatecpg.estoque_inteligente.databinding.ItemProdutoBinding
import br.edu.fatecpg.estoque_inteligente.model.ResProduto
import java.util.Locale

class ProdutoAdapter(
    private var produtos: List<ResProduto>,
    private val onItemClick: (ResProduto) -> Unit) : RecyclerView.Adapter<ProdutoAdapter.ProdutoViewHolder>() {

    private var produtosFiltrados: List<ResProduto> = produtos.toList()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProdutoViewHolder {
        val binding = ItemProdutoBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ProdutoViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ProdutoViewHolder, position: Int) {
        val produto = produtosFiltrados[position]
        holder.binding.nomeProduto.text = produto.nm_produto
        holder.binding.valQuantidade.text = "${produto.val_quantidade} ${produto.type_quantidade ?: ""}"
        holder.binding.categoria.text = produto.labels.getOrNull(0) ?: "Sem categoria"

        holder.itemView.setOnClickListener {
            onItemClick(produto)
        }
    }

    override fun getItemCount(): Int = produtosFiltrados.size

    fun filtrar(query: String) {
        val textoFiltro = query.lowercase(Locale.getDefault())
        produtosFiltrados = if (textoFiltro.isEmpty()) {
            produtos
        } else {
            produtos.filter {
                it.nm_produto.lowercase(Locale.getDefault()).contains(textoFiltro)
            }
        }
        notifyDataSetChanged()
    }

    fun atualizarLista(novaLista: List<ResProduto>) {
        produtos = novaLista
        produtosFiltrados = novaLista.toList()
        notifyDataSetChanged()
    }

    inner class ProdutoViewHolder(val binding: ItemProdutoBinding) : RecyclerView.ViewHolder(binding.root)
}
