package com.ghosthvj.todoit.ui.screens.stats

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.ghosthvj.todoit.data.model.GlobalStats
import com.ghosthvj.todoit.ui.components.parseColor
import com.ghosthvj.todoit.ui.theme.PriorityHigh
import com.ghosthvj.todoit.ui.theme.PriorityLow
import com.ghosthvj.todoit.ui.theme.PriorityMedium
import com.ghosthvj.todoit.ui.theme.PriorityUrgent
import com.ghosthvj.todoit.ui.theme.Teal600

@Composable
fun StatsScreen(statsViewModel: StatsViewModel = viewModel()) {
    val stats by statsViewModel.stats.collectAsState()
    val isLoading by statsViewModel.isLoading.collectAsState()
    val error by statsViewModel.error.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) { statsViewModel.loadStats() }
    LaunchedEffect(error) {
        error?.let { snackbarHostState.showSnackbar(it); statsViewModel.clearError() }
    }

    Scaffold(snackbarHost = { SnackbarHost(snackbarHostState) }) { padding ->
        when {
            isLoading && stats == null -> Box(Modifier.fillMaxSize().padding(padding)) {
                CircularProgressIndicator(Modifier.align(Alignment.Center), color = Teal600)
            }
            stats == null -> Box(Modifier.fillMaxSize().padding(padding)) {
                Text(
                    "No hay datos disponibles",
                    modifier = Modifier.align(Alignment.Center),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            else -> StatsContent(stats = stats!!, modifier = Modifier.padding(padding))
        }
    }
}

@Composable
private fun StatsContent(stats: GlobalStats, modifier: Modifier = Modifier) {
    LazyColumn(
        modifier = modifier,
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Metric cards 2×2 grid
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    MetricCard("Total", stats.total.toString(), Color(0xFF3B82F6), modifier = Modifier.weight(1f))
                    MetricCard("Completadas", stats.completed.toString(), Color(0xFF22C55E), modifier = Modifier.weight(1f))
                }
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    MetricCard("Pendientes", stats.pending.toString(), Color(0xFFF97316), modifier = Modifier.weight(1f))
                    MetricCard("En progreso", stats.inProgress.toString(), Color(0xFF8B5CF6), modifier = Modifier.weight(1f))
                }
            }
        }

        // Due soon / overdue
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                MetricCard("Próximas (7d)", stats.dueSoon.toString(), Color(0xFFF59E0B), modifier = Modifier.weight(1f))
                MetricCard("Atrasadas", stats.overdue.toString(), Color(0xFFEF4444), modifier = Modifier.weight(1f))
            }
        }

        // Completion ring
        item {
            Card(
                shape = RoundedCornerShape(12.dp),
                elevation = CardDefaults.cardElevation(1.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        "Tasa de completado",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(Modifier.height(16.dp))
                    CompletionRing(
                        percentage = stats.completionRate.toFloat(),
                        modifier = Modifier.size(140.dp)
                    )
                }
            }
        }

        // Activity chart (last 14 days)
        if (stats.activity.isNotEmpty()) {
            item {
                Card(shape = RoundedCornerShape(12.dp), elevation = CardDefaults.cardElevation(1.dp)) {
                    Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                        Text(
                            "Actividad reciente",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(Modifier.height(12.dp))
                        ActivityBars(activity = stats.activity.takeLast(14))
                    }
                }
            }
        }

        // By priority
        if (stats.byPriority.isNotEmpty()) {
            item {
                Card(shape = RoundedCornerShape(12.dp), elevation = CardDefaults.cardElevation(1.dp)) {
                    Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                        Text("Por prioridad", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                        Spacer(Modifier.height(8.dp))
                        stats.byPriority.sortedByDescending { it.count }.forEach { p ->
                            val color = when (p.priority) {
                                "LOW" -> PriorityLow
                                "MEDIUM" -> PriorityMedium
                                "HIGH" -> PriorityHigh
                                "URGENT" -> PriorityUrgent
                                else -> PriorityMedium
                            }
                            val label = when (p.priority) {
                                "LOW" -> "Baja"
                                "MEDIUM" -> "Media"
                                "HIGH" -> "Alta"
                                "URGENT" -> "Urgente"
                                else -> p.priority
                            }
                            PriorityRow(label = label, count = p.count, color = color, total = stats.total)
                        }
                    }
                }
            }
        }

        // By list
        if (stats.byList.isNotEmpty()) {
            item {
                Card(shape = RoundedCornerShape(12.dp), elevation = CardDefaults.cardElevation(1.dp)) {
                    Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                        Text("Por lista", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                        Spacer(Modifier.height(8.dp))
                        stats.byList.forEach { ls ->
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier.size(10.dp).clip(CircleShape).background(parseColor(ls.color))
                                )
                                Spacer(Modifier.width(10.dp))
                                Text(ls.name, modifier = Modifier.weight(1f), fontSize = 13.sp)
                                Text(
                                    "${ls.completed}/${ls.total}",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Spacer(Modifier.width(8.dp))
                                LinearProgressIndicator(
                                    progress = { if (ls.total > 0) ls.completed.toFloat() / ls.total else 0f },
                                    modifier = Modifier.width(64.dp).height(4.dp).clip(CircleShape),
                                    color = parseColor(ls.color),
                                    trackColor = parseColor(ls.color).copy(alpha = 0.2f)
                                )
                            }
                        }
                    }
                }
            }
        }

        item { Spacer(Modifier.height(16.dp)) }
    }
}

@Composable
private fun MetricCard(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                value,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = color
            )
            Text(
                label,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun CompletionRing(percentage: Float, modifier: Modifier = Modifier) {
    val primary = Teal600
    val track = MaterialTheme.colorScheme.surfaceVariant

    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val stroke = Stroke(width = size.minDimension * 0.12f, cap = StrokeCap.Round)
            val inset = stroke.width / 2f
            val arcSize = Size(size.width - stroke.width, size.height - stroke.width)
            val topLeft = Offset(inset, inset)

            // Track
            drawArc(
                color = track,
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = stroke
            )
            // Progress
            if (percentage > 0f) {
                drawArc(
                    color = primary,
                    startAngle = -90f,
                    sweepAngle = (percentage / 100f) * 360f,
                    useCenter = false,
                    topLeft = topLeft,
                    size = arcSize,
                    style = stroke
                )
            }
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                "%.0f%%".format(percentage),
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                color = Teal600
            )
            Text(
                "completado",
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun ActivityBars(activity: List<com.ghosthvj.todoit.data.model.ActivityDay>) {
    val maxCount = activity.maxOfOrNull { it.count } ?: 1
    val primary = Teal600

    Row(
        modifier = Modifier.fillMaxWidth().height(60.dp),
        horizontalArrangement = Arrangement.spacedBy(3.dp),
        verticalAlignment = Alignment.Bottom
    ) {
        activity.forEach { day ->
            val heightFraction = if (maxCount > 0) day.count.toFloat() / maxCount else 0f
            Column(
                modifier = Modifier.weight(1f),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Bottom
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                ) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .fillMaxWidth()
                            .fillMaxHeight(heightFraction.coerceAtLeast(0.04f))
                            .clip(RoundedCornerShape(topStart = 3.dp, topEnd = 3.dp))
                            .background(
                                if (day.count > 0) primary.copy(alpha = 0.7f)
                                else MaterialTheme.colorScheme.surfaceVariant
                            )
                    )
                }
            }
        }
    }
}

@Composable
private fun PriorityRow(label: String, count: Int, color: Color, total: Int) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(shape = RoundedCornerShape(4.dp), color = color.copy(alpha = 0.12f)) {
            Text(
                label,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = color
            )
        }
        Spacer(Modifier.weight(1f))
        Text(count.toString(), fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.width(8.dp))
        LinearProgressIndicator(
            progress = { if (total > 0) count.toFloat() / total else 0f },
            modifier = Modifier.width(72.dp).height(4.dp).clip(CircleShape),
            color = color,
            trackColor = color.copy(alpha = 0.15f)
        )
    }
}
