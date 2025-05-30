package br.edu.fatecpg.estoque_inteligente.utils

import br.edu.fatecpg.estoque_inteligente.model.Color

class ColorsProvider {
    fun stringToColor(input: String): Color {
        val hash = input.hashCode()
        val r = (hash shr 16) and 0xFF
        val g = (hash shr 8) and 0xFF
        val b = hash and 0xFF
        return Color(r, g, b)
    }

    fun getContrastColor(bg: Color): Color {
        val luminance = 0.299 * bg.red + 0.587 * bg.green + 0.114 * bg.blue
        return if (luminance > 128) Color(0, 0, 0) else Color(255, 255, 255)
    }

    fun stringToThemeColors(input: String): Pair<Color, Color> {
        val background = stringToColor(input)
        val foreground = getContrastColor(background)
        return Pair(background, foreground)
    }
}