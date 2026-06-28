package com.ghosthvj.todoit.ui.screens.board

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.CheckBox
import androidx.compose.material.icons.outlined.List
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
import com.ghosthvj.todoit.ui.AppViewModel
import com.ghosthvj.todoit.ui.components.ConfirmDialog
import com.ghosthvj.todoit.ui.components.ListFormDialog
import com.ghosthvj.todoit.ui.components.parseColor

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BoardScreen(
    appViewModel: AppViewModel,
    onNavigateToList: (String) -> Unit
) {
    val lists by appViewModel.lists.collectAsState()
    val isLoading by appViewModel.isLoading.collectAsState()
    val error by appViewModel.error.collectAsState()

    var showCreateDialog by remember { mutableStateOf(false) }
    var editingList by remember { mutableStateOf<TaskList?>(null) }
    var deletingList by remember { mutableStateOf<TaskList?>(null) }

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(error) {
        error?.let {
            snackbarHostState.showSnackbar(it)
            appViewModel.clearError()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showCreateDialog = true },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary
            ) {
                Icon(Icons.Default.Add, contentDescription = "Nueva lista")
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when {
                isLoading && lists.isEmpty() -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center),
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                lists.isEmpty() -> {
                    EmptyBoard(onCreateList = { showCreateDialog = true })
                }
                else -> {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(lists, key = { it.id }) { list ->
                            ListCard(
                                list = list,
                                onClick = { onNavigateToList(list.id) },
                                onEdit = { editingList = list },
                                onDelete = { deletingList = list }
                            )
                        }
                        item { Spacer(Modifier.height(72.dp)) }
                    }
                }
            }
        }
    }

    if (showCreateDialog) {
        ListFormDialog(
            onDismiss = { showCreateDialog = false },
            onSave = { name, color, type ->
                appViewModel.createList(name, color, type)
            }
        )
    }

    editingList?.let { list ->
        ListFormDialog(
            editingList = list,
            onDismiss = { editingList = null },
            onSave = { name, color, _ ->
                appViewModel.updateList(list.id, name, color)
                editingList = null
            }
        )
    }

    deletingList?.let { list ->
        ConfirmDialog(
            title = "Eliminar lista",
            message = "¿Eliminar \"${list.name}\" y todo su contenido? Esta acción no se puede deshacer.",
            onConfirm = {
                appViewModel.deleteList(list.id)
                deletingList = null
            },
            onDismiss = { deletingList = null }
        )
    }
}

@Composable
private fun ListCard(
    list: TaskList,
    onClick: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val listColor = parseColor(list.color)
    var menuExpanded by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column {
            // Top color strip
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(4.dp)
                    .background(listColor)
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Icon indicator
                if (list.type == "CHECKLIST") {
                    Icon(
                        Icons.Outlined.CheckBox,
                        contentDescription = null,
                        tint = listColor,
                        modifier = Modifier.size(18.dp)
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .size(12.dp)
                            .clip(CircleShape)
                            .background(listColor)
                    )
                }

                Spacer(Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = list.name,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 15.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = if (list.type == "CHECKLIST") "Lista simple" else "Lista de tareas",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // Pending count badge
                if (list.pendingCount > 0) {
                    Surface(
                        shape = CircleShape,
                        color = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        Text(
                            text = list.pendingCount.toString(),
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Spacer(Modifier.width(4.dp))

                // Options menu
                Box {
                    IconButton(onClick = { menuExpanded = true }, modifier = Modifier.size(36.dp)) {
                        Icon(
                            Icons.Default.MoreVert,
                            contentDescription = "Opciones",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    DropdownMenu(
                        expanded = menuExpanded,
                        onDismissRequest = { menuExpanded = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("Editar") },
                            leadingIcon = { Icon(Icons.Default.Edit, null, modifier = Modifier.size(16.dp)) },
                            onClick = { menuExpanded = false; onEdit() }
                        )
                        DropdownMenuItem(
                            text = { Text("Eliminar", color = MaterialTheme.colorScheme.error) },
                            leadingIcon = { Icon(Icons.Default.Delete, null, tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(16.dp)) },
                            onClick = { menuExpanded = false; onDelete() }
                        )
                    }
                }

                Icon(
                    Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

@Composable
private fun EmptyBoard(onCreateList: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            Icons.Outlined.List,
            contentDescription = null,
            modifier = Modifier.size(56.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f)
        )
        Spacer(Modifier.height(16.dp))
        Text(
            "No hay listas creadas",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(Modifier.height(8.dp))
        Text(
            "Crea tu primera lista para empezar",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
        )
        Spacer(Modifier.height(24.dp))
        Button(onClick = onCreateList) {
            Icon(Icons.Default.Add, null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(8.dp))
            Text("Crear primera lista")
        }
    }
}
