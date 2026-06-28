package com.ghosthvj.todoit.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = Teal600,
    onPrimary = Color.White,
    primaryContainer = Teal100,
    onPrimaryContainer = Teal950,
    secondary = Teal700,
    onSecondary = Color.White,
    secondaryContainer = Teal50,
    onSecondaryContainer = Teal700,
    background = Gray50,
    onBackground = Gray900,
    surface = Color.White,
    onSurface = Gray900,
    surfaceVariant = Gray100,
    onSurfaceVariant = Gray500,
    outline = Gray300,
    error = PriorityUrgent,
    onError = Color.White,
)

private val DarkColorScheme = darkColorScheme(
    primary = Teal400,
    onPrimary = Teal950,
    primaryContainer = Teal700,
    onPrimaryContainer = Teal100,
    secondary = Teal600,
    onSecondary = Color.White,
    secondaryContainer = Gray800,
    onSecondaryContainer = Teal400,
    background = Gray950,
    onBackground = Color(0xFFF1F5F9),
    surface = Color(0xFF1E293B),
    onSurface = Color(0xFFF1F5F9),
    surfaceVariant = Gray800,
    onSurfaceVariant = Gray400,
    outline = Gray700,
    error = Color(0xFFF87171),
    onError = Color(0xFF7F1D1D),
)

@Composable
fun ToDoITTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme,
        typography = Typography,
        content = content
    )
}
