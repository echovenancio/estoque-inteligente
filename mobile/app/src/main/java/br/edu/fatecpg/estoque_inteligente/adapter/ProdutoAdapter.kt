package br.edu.fatecpg.estoque_inteligente.adapter

import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import br.edu.fatecpg.estoque_inteligente.databinding.ItemProdutoBinding
import br.edu.fatecpg.estoque_inteligente.model.ResProduto
import br.edu.fatecpg.estoque_inteligente.utils.ColorsProvider
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
        val label = produto.best_describer
        holder.binding.nomeProduto.text = produto.nm_produto
        if (produto.val_quantidade == 0.0f) {
            holder.binding.valQuantidade.text = "Esgotado"
            holder.binding.valQuantidade.setTextColor(Color.RED)
        } else {
            holder.binding.valQuantidade.text = "${produto.val_quantidade} ${produto.type_quantidade ?: ""}"
            holder.binding.valQuantidade.setTextColor(Color.BLACK)
        }
        holder.binding.categoria.text = label
        val (bg, fg) = ColorsProvider().stringToThemeColors(label)
        val bgColor = Color.rgb(bg.red, bg.green, bg.blue)
        val fgColor = Color.rgb(fg.red, fg.green, fg.blue)
        holder.binding.categoria.text = label

        val background = holder.binding.frameCategoria.background.mutate() as GradientDrawable
        background.setColor(bgColor)

        holder.binding.categoria.setTextColor(fgColor)


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
