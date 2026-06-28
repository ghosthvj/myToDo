package com.ghosthvj.todoit.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ghosthvj.todoit.data.model.Task
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun TaskDetailDialog(
    task: Task,
    listColor: Color,
    onDismiss: () -> Unit,
    onToggle: () -> Unit,
    onEdit: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.Top) {
                Column(modifier = Modifier.weight(1f)) {
                    // Status badge
                    val (statusLabel, statusColor) = when (task.status) {
                        "COMPLETED" -> "Completada" to Color(0xFF22C55E)
                        "IN_PROGRESS" -> "En progreso" to Color(0xFF3B82F6)
                        else -> "Pendiente" to Color(0xFF6B7280)
                    }
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = statusColor.copy(alpha = 0.12f)
                    ) {
                        Text(
                            statusLabel,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = statusColor
                        )
                    }
                    Spacer(Modifier.height(6.dp))
                    Text(
                        task.title,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        textDecoration = if (task.isCompleted) TextDecoration.LineThrough else null
                    )
                }
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (!task.description.isNullOrBlank()) {
                    Text(task.description, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 14.sp)
                    HorizontalDivider()
                }

                // Priority
                DetailRow(icon = Icons.Default.Flag, label = "Prioridad") {
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = priorityColor(task.priority).copy(alpha = 0.12f)
                    ) {
                        Text(
                            priorityLabel(task.priority),
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                            fontSize = 12.sp,
                            color = priorityColor(task.priority)
                        )
                    }
                }

                // Due date
                task.dueDate?.let { date ->
                    val (label, color) = formatDueDateFull(date)
                    DetailRow(icon = Icons.Default.CalendarMonth, label = "Fecha límite") {
                        Text(label, fontSize = 13.sp, color = color)
                    }
                }

                // Tags
                if (task.tagList.isNotEmpty()) {
                    DetailRow(icon = Icons.Default.Tag, label = "Etiquetas") {
                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            task.tagList.forEach { tag ->
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = MaterialTheme.colorScheme.surfaceVariant
                                ) {
                                    Text(
                                        "#$tag",
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                }

                // Created date
                task.createdAt.takeIf { it.isNotBlank() }?.let {
                    DetailRow(icon = Icons.Default.Schedule, label = "Creada") {
                        Text(formatIsoDate(it), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }

                // Completed date
                task.completedAt?.let {
                    DetailRow(icon = Icons.Default.CheckCircle, label = "Completada") {
                        Text(formatIsoDate(it), fontSize = 12.sp, color = Color(0xFF22C55E))
                    }
                }
            }
        },
        confirmButton = {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = { onEdit() },
                    border = ButtonDefaults.outlinedButtonBorder
                ) {
                    Icon(Icons.Default.Edit, null, modifier = Modifier.size(14.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Editar")
                }
                Button(
                    onClick = onToggle,
                    colors = ButtonDefaults.buttonColors(containerColor = listColor)
                ) {
                    Icon(
                        if (task.isCompleted) Icons.Default.Refresh else Icons.Default.CheckCircle,
                        null,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(if (task.isCompleted) "Reabrir" else "Completar")
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cerrar") }
        }
    )
}

@Composable
private fun DetailRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    content: @Composable () -> Unit
) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Icon(icon, null, modifier = Modifier.size(16.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f))
        Text(label, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.width(80.dp))
        content()
    }
}

private fun formatDueDateFull(dateStr: String): Pair<String, Color> {
    return runCatching {
        val date = LocalDate.parse(dateStr.take(10))
        val today = LocalDate.now()
        val fmt = DateTimeFormatter.ofPattern("d 'de' MMMM yyyy", Locale("es"))
        when {
            date.isBefore(today) -> "Atrasada — ${date.format(fmt)}" to Color(0xFFEF4444)
            date == today -> "Hoy — ${date.format(fmt)}" to Color(0xFFF97316)
            date == today.plusDays(1) -> "Mañana — ${date.format(fmt)}" to Color(0xFF3B82F6)
            else -> date.format(fmt) to Color(0xFF6B7280)
        }
    }.getOrElse { dateStr to Color(0xFF6B7280) }
}

private fun formatIsoDate(isoStr: String): String {
    return runCatching {
        val instant = Instant.parse(isoStr)
        val date = instant.atZone(ZoneId.systemDefault()).toLocalDate()
        val fmt = DateTimeFormatter.ofPattern("d 'de' MMM yyyy", Locale("es"))
        date.format(fmt)
    }.getOrElse { isoStr }
}
