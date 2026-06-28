package com.ghosthvj.todoit.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckBox
import androidx.compose.material.icons.filled.List
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ghosthvj.todoit.data.model.TaskList

private val PRESET_COLORS = listOf(
    "#0d9488", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
    "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#64748b"
)

fun parseColor(hex: String): Color {
    return try {
        Color(android.graphics.Color.parseColor(hex))
    } catch (_: Exception) {
        Color(0xFF0D9488)
    }
}

@Composable
fun ListFormDialog(
    editingList: TaskList? = null,
    onDismiss: () -> Unit,
    onSave: (name: String, color: String, type: String) -> Unit
) {
    var name by remember(editingList) { mutableStateOf(editingList?.name ?: "") }
    var selectedColor by remember(editingList) { mutableStateOf(editingList?.color ?: "#0d9488") }
    var selectedType by remember(editingList) { mutableStateOf(editingList?.type ?: "TASK") }
    var nameError by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = if (editingList != null) "Editar lista" else "Nueva lista",
                fontWeight = FontWeight.SemiBold
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {

                // Name field
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it; nameError = false },
                    label = { Text("Nombre *") },
                    isError = nameError,
                    supportingText = if (nameError) ({ Text("El nombre es obligatorio") }) else null,
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                )

                // Type selector (only when creating)
                if (editingList == null) {
                    Text(
                        "Tipo",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        TypeButton(
                            label = "Lista de tareas",
                            icon = Icons.Default.List,
                            selected = selectedType == "TASK",
                            selectedColor = MaterialTheme.colorScheme.primary,
                            onClick = { selectedType = "TASK" },
                            modifier = Modifier.weight(1f)
                        )
                        TypeButton(
                            label = "Lista simple",
                            icon = Icons.Default.CheckBox,
                            selected = selectedType == "CHECKLIST",
                            selectedColor = MaterialTheme.colorScheme.primary,
                            onClick = { selectedType = "CHECKLIST" },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                // Color picker — two rows of 5
                Text(
                    "Color",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        PRESET_COLORS.take(5).forEach { hex ->
                            ColorDot(hex, selectedColor) { selectedColor = hex }
                        }
                    }
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        PRESET_COLORS.drop(5).forEach { hex ->
                            ColorDot(hex, selectedColor) { selectedColor = hex }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (name.isBlank()) { nameError = true; return@Button }
                    onSave(name.trim(), selectedColor, selectedType)
                    onDismiss()
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = parseColor(selectedColor)
                )
            ) {
                Text(if (editingList != null) "Guardar" else "Crear lista")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancelar") }
        }
    )
}

@Composable
private fun RowScope.ColorDot(hex: String, selectedHex: String, onClick: () -> Unit) {
    val color = parseColor(hex)
    val isSelected = hex == selectedHex
    Box(
        modifier = Modifier
            .weight(1f)
            .aspectRatio(1f)
            .clip(CircleShape)
            .background(color)
            .then(
                if (isSelected) Modifier.border(3.dp, Color.White, CircleShape)
                else Modifier
            )
            .clickable(onClick = onClick)
    )
}

@Composable
private fun TypeButton(
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    selected: Boolean,
    selectedColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val borderColor = if (selected) selectedColor else MaterialTheme.colorScheme.outline
    val bgColor = if (selected) selectedColor.copy(alpha = 0.1f) else MaterialTheme.colorScheme.surface
    val contentColor = if (selected) selectedColor else MaterialTheme.colorScheme.onSurfaceVariant
    val borderWidth = if (selected) 2.dp else 1.dp

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp),
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(bgColor)
            .border(borderWidth, borderColor, RoundedCornerShape(10.dp))
            .clickable(onClick = onClick)
            .padding(12.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = contentColor,
            modifier = Modifier.size(20.dp)
        )
        Text(
            text = label,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            color = contentColor
        )
    }
}
