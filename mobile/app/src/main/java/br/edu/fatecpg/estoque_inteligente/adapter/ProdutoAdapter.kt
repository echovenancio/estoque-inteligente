package br.edu.fatecpg.estoque_inteligente.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import br.edu.fatecpg.estoque_inteligente.databinding.ItemProdutoBinding
import br.edu.fatecpg.estoque_inteligente.model.ResProduto
import java.util.Locale

class ProdutoAdapter(private var produtos: List<ResProduto>) : RecyclerView.Adapter<ProdutoAdapter.ProdutoViewHolder>() {

    private var produtosFiltrados: List<ResProduto> = produtos.toList()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProdutoViewHolder {
        val binding = ItemProdutoBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ProdutoViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ProdutoViewHolder, position: Int) {
        val produto = produtosFiltrados[position]
        holder.binding.nomeProduto.text = produto.nm_produto
        holder.binding.tipoQuantidade.text = produto.type_quantidade
        holder.binding.valQuantidade.text = produto.val_quantidade.toString()
        holder.binding.categoria.text = produto.labels[0]
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
