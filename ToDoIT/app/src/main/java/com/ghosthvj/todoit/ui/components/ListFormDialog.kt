package com.ghosthvj.todoit.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.ExperimentalLayoutApi
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
    "#0d9488", "#8b5cf6", "#ec4899", "#ef4444",
    "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#3b82f6", "#64748b"
)

fun parseColor(hex: String): Color {
    return try {
        Color(android.graphics.Color.parseColor(hex))
    } catch (_: Exception) {
        Color(0xFF0D9488)
    }
}

@OptIn(ExperimentalLayoutApi::class)
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
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        TypeButton(
                            label = "Lista de tareas",
                            icon = { Icon(Icons.Default.List, null, modifier = Modifier.size(20.dp)) },
                            selected = selectedType == "TASK",
                            onClick = { selectedType = "TASK" },
                            modifier = Modifier.weight(1f)
                        )
                        TypeButton(
                            label = "Lista simple",
                            icon = { Icon(Icons.Default.CheckBox, null, modifier = Modifier.size(20.dp)) },
                            selected = selectedType == "CHECKLIST",
                            onClick = { selectedType = "CHECKLIST" },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                // Color picker
                Text(
                    "Color",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    PRESET_COLORS.forEach { colorHex ->
                        val color = parseColor(colorHex)
                        val isSelected = selectedColor == colorHex
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(color)
                                .then(
                                    if (isSelected) Modifier.border(3.dp, MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), CircleShape)
                                    else Modifier
                                )
                                .clickable { selectedColor = colorHex }
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (name.isBlank()) {
                        nameError = true
                        return@Button
                    }
                    onSave(name.trim(), selectedColor, selectedType)
                    onDismiss()
                },
                colors = ButtonDefaults.buttonColors(containerColor = parseColor(selectedColor))
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
private fun TypeButton(
    label: String,
    icon: @Composable () -> Unit,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val borderColor = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
    val bgColor = if (selected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent
    val contentColor = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant

    Surface(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .border(if (selected) 2.dp else 1.dp, borderColor, RoundedCornerShape(10.dp))
            .clickable(onClick = onClick),
        color = bgColor
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(4.dp),
            modifier = Modifier.padding(12.dp)
        ) {
            CompositionLocalProvider(LocalContentColor provides contentColor) {
                icon()
                Text(label, fontSize = 12.sp, fontWeight = FontWeight.Medium, color = contentColor)
            }
        }
    }
}
