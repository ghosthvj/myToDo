package com.ghosthvj.todoit.ui.components

import android.app.DatePickerDialog
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ghosthvj.todoit.data.model.Task
import com.ghosthvj.todoit.ui.theme.PriorityHigh
import com.ghosthvj.todoit.ui.theme.PriorityLow
import com.ghosthvj.todoit.ui.theme.PriorityMedium
import com.ghosthvj.todoit.ui.theme.PriorityUrgent
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Calendar

data class TaskFormData(
    val title: String,
    val description: String,
    val priority: String,
    val dueDate: String?,
    val tags: String
)

private val PRIORITIES = listOf(
    "LOW" to "Baja",
    "MEDIUM" to "Media",
    "HIGH" to "Alta",
    "URGENT" to "Urgente"
)

fun priorityColor(priority: String): Color = when (priority) {
    "LOW" -> PriorityLow
    "MEDIUM" -> PriorityMedium
    "HIGH" -> PriorityHigh
    "URGENT" -> PriorityUrgent
    else -> PriorityMedium
}

fun priorityLabel(priority: String): String = when (priority) {
    "LOW" -> "Baja"
    "MEDIUM" -> "Media"
    "HIGH" -> "Alta"
    "URGENT" -> "Urgente"
    else -> "Media"
}

@Composable
fun TaskFormDialog(
    editingTask: Task? = null,
    onDismiss: () -> Unit,
    onSave: (TaskFormData) -> Unit
) {
    var title by remember(editingTask) { mutableStateOf(editingTask?.title ?: "") }
    var description by remember(editingTask) { mutableStateOf(editingTask?.description ?: "") }
    var priority by remember(editingTask) { mutableStateOf(editingTask?.priority ?: "MEDIUM") }
    var dueDate by remember(editingTask) {
        mutableStateOf(editingTask?.dueDate?.take(10)) // yyyy-MM-dd
    }
    var tags by remember(editingTask) { mutableStateOf(editingTask?.tags ?: "") }
    var titleError by remember { mutableStateOf(false) }

    val context = LocalContext.current

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                if (editingTask != null) "Editar tarea" else "Nueva tarea",
                fontWeight = FontWeight.SemiBold
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it; titleError = false },
                    label = { Text("Título *") },
                    isError = titleError,
                    supportingText = if (titleError) ({ Text("El título es obligatorio") }) else null,
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                )

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Descripción") },
                    minLines = 2,
                    maxLines = 4,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                )

                // Priority selector
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        "Prioridad",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        PRIORITIES.forEach { (value, label) ->
                            val selected = priority == value
                            val color = priorityColor(value)
                            FilterChip(
                                selected = selected,
                                onClick = { priority = value },
                                label = { Text(label, fontSize = 12.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = color.copy(alpha = 0.15f),
                                    selectedLabelColor = color
                                ),
                                border = FilterChipDefaults.filterChipBorder(
                                    enabled = true,
                                    selected = selected,
                                    selectedBorderColor = color,
                                    selectedBorderWidth = 1.5.dp
                                )
                            )
                        }
                    }
                }

                // Due date picker
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        "Fecha límite",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    OutlinedButton(
                        onClick = {
                            val cal = Calendar.getInstance()
                            dueDate?.let {
                                runCatching {
                                    val d = LocalDate.parse(it)
                                    cal.set(d.year, d.monthValue - 1, d.dayOfMonth)
                                }
                            }
                            DatePickerDialog(
                                context,
                                { _, year, month, day ->
                                    dueDate = "%04d-%02d-%02d".format(year, month + 1, day)
                                },
                                cal.get(Calendar.YEAR),
                                cal.get(Calendar.MONTH),
                                cal.get(Calendar.DAY_OF_MONTH)
                            ).show()
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.CalendarMonth, null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(8.dp))
                        Text(
                            dueDate?.let { formatDueDateFull(it) } ?: "Sin fecha",
                            fontSize = 14.sp
                        )
                        Spacer(Modifier.weight(1f))
                        if (dueDate != null) {
                            TextButton(
                                onClick = { dueDate = null },
                                contentPadding = PaddingValues(0.dp),
                                modifier = Modifier.height(24.dp)
                            ) {
                                Text("Quitar", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }

                OutlinedTextField(
                    value = tags,
                    onValueChange = { tags = it },
                    label = { Text("Etiquetas (separadas por coma)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (title.isBlank()) { titleError = true; return@Button }
                    onSave(TaskFormData(title.trim(), description.trim(), priority, dueDate, tags.trim()))
                    onDismiss()
                }
            ) {
                Text(if (editingTask != null) "Guardar" else "Crear tarea")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancelar") }
        }
    )
}

private fun formatDueDateFull(dateStr: String): String {
    return runCatching {
        val date = LocalDate.parse(dateStr)
        val formatter = DateTimeFormatter.ofPattern("d MMM yyyy", java.util.Locale("es"))
        date.format(formatter)
    }.getOrElse { dateStr }
}
