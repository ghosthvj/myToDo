package com.ghosthvj.todoit.ui.screens.list

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.zIndex
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshContainer
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.ghosthvj.todoit.data.model.ChecklistItem
import com.ghosthvj.todoit.data.model.Task
import com.ghosthvj.todoit.data.model.TaskList
import com.ghosthvj.todoit.ui.components.*
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ListScreen(
    listId: String,
    list: TaskList?,
    onBack: () -> Unit
) {
    val viewModel: ListViewModel = viewModel(
        key = listId,
        factory = ListViewModelFactory(listId)
    )
    val error by viewModel.error.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(error) {
        error?.let { snackbarHostState.showSnackbar(it); viewModel.clearError() }
    }

    val listColor = list?.let { parseColor(it.color) } ?: MaterialTheme.colorScheme.primary

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(listColor))
                        Text(list?.name ?: "", fontWeight = FontWeight.SemiBold)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Volver")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when (list?.type) {
                "CHECKLIST" -> ChecklistContent(viewModel, listId, listColor)
                else -> TaskListContent(viewModel, listId, listColor)
            }
        }
    }
}

// ── Task list ─────────────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun TaskListContent(viewModel: ListViewModel, listId: String, listColor: Color) {
    val tasks by viewModel.tasks.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    var showAddTask by remember { mutableStateOf(false) }
    var editingTask by remember { mutableStateOf<Task?>(null) }
    var viewingTask by remember { mutableStateOf<Task?>(null) }
    var deletingTask by remember { mutableStateOf<Task?>(null) }
    var completedExpanded by remember { mutableStateOf(false) }

    LaunchedEffect(listId) { viewModel.loadTasks() }

    val pending = tasks.filter { !it.isCompleted }
    val completed = tasks.filter { it.isCompleted }

    var localPending by remember { mutableStateOf(pending) }
    LaunchedEffect(pending) { localPending = pending }

    // Pull-to-refresh
    val pullState = rememberPullToRefreshState()
    LaunchedEffect(pullState.isRefreshing) {
        if (pullState.isRefreshing) viewModel.loadTasks()
    }
    LaunchedEffect(isLoading) {
        if (!isLoading && pullState.isRefreshing) pullState.endRefresh()
    }

    // Drag-to-reorder
    val lazyListState = rememberLazyListState()
    val dragState = rememberDragDropState(lazyListState) { from, to ->
        localPending = localPending.toMutableList().apply { add(to, removeAt(from)) }
    }

    Box(Modifier.fillMaxSize()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .nestedScroll(pullState.nestedScrollConnection)
        ) {
            when {
                isLoading && tasks.isEmpty() -> CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center),
                    color = listColor
                )
                tasks.isEmpty() -> EmptyTaskList(listColor = listColor, onAdd = { showAddTask = true })
                else -> LazyColumn(
                    state = lazyListState,
                    contentPadding = PaddingValues(
                        start = 16.dp, end = 16.dp, top = 8.dp, bottom = 96.dp
                    ),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    itemsIndexed(localPending, key = { _, t -> t.id }) { index, task ->
                        TaskCard(
                            task = task,
                            listColor = listColor,
                            isDragging = dragState.isDragging(index),
                            modifier = Modifier
                                .zIndex(dragState.zIndex(index))
                                .graphicsLayer { translationY = dragState.translationY(index) }
                                .dragGestures(dragState) {
                                    viewModel.reorderTasks(localPending + completed)
                                },
                            onToggle = { viewModel.toggleTask(task.id) },
                            onEdit = { editingTask = task },
                            onDelete = { deletingTask = task },
                            onClick = { viewingTask = task }
                        )
                    }

                    if (completed.isNotEmpty()) {
                        item {
                            TextButton(
                                onClick = { completedExpanded = !completedExpanded },
                                contentPadding = PaddingValues(horizontal = 4.dp)
                            ) {
                                Icon(
                                    if (completedExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                                    null, modifier = Modifier.size(16.dp)
                                )
                                Spacer(Modifier.width(4.dp))
                                Text("${completed.size} completada${if (completed.size != 1) "s" else ""}",
                                    style = MaterialTheme.typography.bodySmall)
                            }
                        }
                        if (completedExpanded) {
                            items(completed, key = { "done_${it.id}" }) { task ->
                                TaskCard(
                                    task = task, listColor = listColor, isDragging = false,
                                    modifier = Modifier,
                                    onToggle = { viewModel.toggleTask(task.id) },
                                    onEdit = { editingTask = task },
                                    onDelete = { deletingTask = task },
                                    onClick = { viewingTask = task }
                                )
                            }
                        }
                    }
                }
            }

            PullToRefreshContainer(
                state = pullState,
                modifier = Modifier.align(Alignment.TopCenter),
                contentColor = listColor
            )
        }

        ExtendedFloatingActionButton(
            onClick = { showAddTask = true },
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            containerColor = listColor, contentColor = Color.White
        ) {
            Icon(Icons.Default.Add, null, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Text("Nueva tarea")
        }
    }

    if (showAddTask) {
        TaskFormDialog(
            onDismiss = { showAddTask = false },
            onSave = { data ->
                viewModel.createTask(data.title, data.description.ifBlank { null },
                    data.priority, data.dueDate, data.tags)
            }
        )
    }
    editingTask?.let { task ->
        TaskFormDialog(editingTask = task, onDismiss = { editingTask = null }, onSave = { data ->
            viewModel.updateTask(task.id, data.title, data.description.ifBlank { null },
                data.priority, data.dueDate, data.tags)
            editingTask = null
        })
    }
    viewingTask?.let { task ->
        TaskDetailDialog(task = task, listColor = listColor,
            onDismiss = { viewingTask = null },
            onToggle = { viewModel.toggleTask(task.id); viewingTask = null },
            onEdit = { viewingTask = null; editingTask = task })
    }
    deletingTask?.let { task ->
        ConfirmDialog(
            title = "Eliminar tarea",
            message = "¿Eliminar \"${task.title}\"?",
            onConfirm = { viewModel.deleteTask(task.id); deletingTask = null },
            onDismiss = { deletingTask = null }
        )
    }
}

@Composable
private fun TaskCard(
    task: Task, listColor: Color, isDragging: Boolean,
    modifier: Modifier = Modifier,
    onToggle: () -> Unit, onEdit: () -> Unit, onDelete: () -> Unit, onClick: () -> Unit
) {
    val priorityColor = priorityColor(task.priority)

    Card(
        onClick = onClick,
        shape = RoundedCornerShape(10.dp),
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = when {
                isDragging -> MaterialTheme.colorScheme.surfaceVariant
                task.isCompleted -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                else -> MaterialTheme.colorScheme.surface
            }
        ),
        elevation = CardDefaults.cardElevation(if (isDragging) 6.dp else 1.dp)
    ) {
        Row(modifier = Modifier.fillMaxWidth().padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            if (!task.isCompleted) {
                Icon(Icons.Default.DragHandle, "Mantener para reordenar",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.35f),
                    modifier = Modifier.size(20.dp))
                Spacer(Modifier.width(4.dp))
            }
            IconButton(onClick = onToggle, modifier = Modifier.size(32.dp)) {
                Icon(
                    if (task.isCompleted) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,
                    null,
                    tint = if (task.isCompleted) listColor
                    else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                    modifier = Modifier.size(22.dp)
                )
            }
            Spacer(Modifier.width(8.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    task.title, fontWeight = FontWeight.Medium, fontSize = 14.sp,
                    textDecoration = if (task.isCompleted) TextDecoration.LineThrough else null,
                    color = if (task.isCompleted)
                        MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                    else MaterialTheme.colorScheme.onSurface
                )
                if (!task.description.isNullOrBlank()) {
                    Text(task.description, fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
                }
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.padding(top = 4.dp)) {
                    Surface(shape = RoundedCornerShape(4.dp), color = priorityColor.copy(alpha = 0.12f)) {
                        Text(priorityLabel(task.priority),
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                            fontSize = 11.sp, fontWeight = FontWeight.Medium, color = priorityColor)
                    }
                    task.dueDate?.let { date ->
                        val (label, color) = formatDueDateChip(date)
                        Surface(shape = RoundedCornerShape(4.dp), color = color.copy(alpha = 0.12f)) {
                            Text(label, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                fontSize = 11.sp, color = color)
                        }
                    }
                }
                if (task.tagList.isNotEmpty()) {
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.padding(top = 4.dp)) {
                        task.tagList.take(3).forEach { tag ->
                            Surface(shape = RoundedCornerShape(4.dp), color = MaterialTheme.colorScheme.surfaceVariant) {
                                Text("#$tag", modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp),
                                    fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
            }
            var menuExpanded by remember { mutableStateOf(false) }
            Box {
                IconButton(onClick = { menuExpanded = true }, modifier = Modifier.size(32.dp)) {
                    Icon(Icons.Default.MoreVert, null, modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                DropdownMenu(expanded = menuExpanded, onDismissRequest = { menuExpanded = false }) {
                    DropdownMenuItem(text = { Text("Editar") },
                        leadingIcon = { Icon(Icons.Default.Edit, null, modifier = Modifier.size(16.dp)) },
                        onClick = { menuExpanded = false; onEdit() })
                    DropdownMenuItem(text = { Text("Eliminar", color = MaterialTheme.colorScheme.error) },
                        leadingIcon = { Icon(Icons.Default.Delete, null, tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(16.dp)) },
                        onClick = { menuExpanded = false; onDelete() })
                }
            }
        }
    }
}

private fun formatDueDateChip(dateStr: String): Pair<String, Color> {
    return runCatching {
        val date = LocalDate.parse(dateStr.take(10))
        val today = LocalDate.now()
        when {
            date.isBefore(today) -> "Atrasada" to Color(0xFFEF4444)
            date == today -> "Hoy" to Color(0xFFF97316)
            date == today.plusDays(1) -> "Mañana" to Color(0xFF3B82F6)
            else -> { val fmt = DateTimeFormatter.ofPattern("d MMM", Locale("es")); date.format(fmt) to Color(0xFF6B7280) }
        }
    }.getOrElse { "—" to Color(0xFF6B7280) }
}

@Composable
private fun EmptyTaskList(listColor: Color, onAdd: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(Icons.Outlined.CheckCircle, null, modifier = Modifier.size(52.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f))
        Spacer(Modifier.height(12.dp))
        Text("Sin tareas", style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))
        Button(onClick = onAdd, colors = ButtonDefaults.buttonColors(containerColor = listColor)) {
            Icon(Icons.Default.Add, null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(6.dp))
            Text("Añadir tarea")
        }
    }
}

// ── Checklist ─────────────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ChecklistContent(viewModel: ListViewModel, listId: String, listColor: Color) {
    val items by viewModel.checklistItems.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    var newItemText by remember { mutableStateOf("") }
    var editingItemId by remember { mutableStateOf<String?>(null) }
    var editingItemText by remember { mutableStateOf("") }
    var completedExpanded by remember { mutableStateOf(true) }

    LaunchedEffect(listId) { viewModel.loadChecklistItems() }

    val pullState = rememberPullToRefreshState()
    LaunchedEffect(pullState.isRefreshing) {
        if (pullState.isRefreshing) viewModel.loadChecklistItems()
    }
    LaunchedEffect(isLoading) {
        if (!isLoading && pullState.isRefreshing) pullState.endRefresh()
    }

    val pending = items.filter { !it.done }
    val completed = items.filter { it.done }

    if (isLoading && items.isEmpty()) {
        Box(Modifier.fillMaxSize()) {
            CircularProgressIndicator(Modifier.align(Alignment.Center), color = listColor)
        }
        return
    }

    Box(Modifier.fillMaxSize().nestedScroll(pullState.nestedScrollConnection)) {
        LazyColumn(
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(2.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(pending, key = { it.id }) { item ->
                ChecklistRow(
                    item = item, isEditing = editingItemId == item.id,
                    editText = if (editingItemId == item.id) editingItemText else item.text,
                    listColor = listColor,
                    onToggle = { viewModel.toggleChecklistItem(item.id, item.done) },
                    onDelete = { viewModel.deleteChecklistItem(item.id) },
                    onStartEdit = { editingItemId = item.id; editingItemText = item.text },
                    onEditChange = { editingItemText = it },
                    onEditDone = {
                        if (editingItemText.isNotBlank() && editingItemText != item.text)
                            viewModel.updateChecklistItemText(item.id, editingItemText.trim())
                        editingItemId = null
                    },
                    onEditCancel = { editingItemId = null }
                )
            }
            item {
                AddItemRow(value = newItemText, onValueChange = { newItemText = it },
                    onDone = {
                        if (newItemText.isNotBlank()) {
                            viewModel.createChecklistItem(newItemText.trim())
                            newItemText = ""
                        }
                    }, listColor = listColor)
            }
            if (completed.isNotEmpty()) {
                item {
                    Spacer(Modifier.height(4.dp))
                    TextButton(onClick = { completedExpanded = !completedExpanded },
                        contentPadding = PaddingValues(horizontal = 4.dp)) {
                        Icon(if (completedExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                            null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("${completed.size} completado${if (completed.size != 1) "s" else ""}",
                            style = MaterialTheme.typography.bodySmall)
                    }
                }
                if (completedExpanded) {
                    items(completed, key = { it.id }) { item ->
                        ChecklistRow(item = item, isEditing = false, editText = item.text,
                            listColor = listColor,
                            onToggle = { viewModel.toggleChecklistItem(item.id, item.done) },
                            onDelete = { viewModel.deleteChecklistItem(item.id) },
                            onStartEdit = {}, onEditChange = {}, onEditDone = {}, onEditCancel = {})
                    }
                }
            }
            item { Spacer(Modifier.height(32.dp)) }
        }
        PullToRefreshContainer(state = pullState, modifier = Modifier.align(Alignment.TopCenter),
            contentColor = listColor)
    }
}

@Composable
private fun AddItemRow(value: String, onValueChange: (String) -> Unit, onDone: () -> Unit, listColor: Color) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(Icons.Default.Add, null,
            modifier = Modifier.padding(start = 4.dp, end = 8.dp).size(20.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f))
        OutlinedTextField(value = value, onValueChange = onValueChange,
            modifier = Modifier.weight(1f), singleLine = true,
            placeholder = { Text("Elemento de lista",
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f), fontSize = 14.sp) },
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { onDone() }),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = listColor, unfocusedBorderColor = Color.Transparent, cursorColor = listColor),
            textStyle = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
private fun ChecklistRow(
    item: ChecklistItem, isEditing: Boolean, editText: String, listColor: Color,
    onToggle: () -> Unit, onDelete: () -> Unit, onStartEdit: () -> Unit,
    onEditChange: (String) -> Unit, onEditDone: () -> Unit, onEditCancel: () -> Unit
) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp), verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = onToggle, modifier = Modifier.size(36.dp)) {
            Icon(if (item.done) Icons.Default.CheckBox else Icons.Default.CheckBoxOutlineBlank, null,
                tint = if (item.done) listColor else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                modifier = Modifier.size(20.dp))
        }
        if (isEditing) {
            val fr = remember { FocusRequester() }
            OutlinedTextField(value = editText, onValueChange = onEditChange,
                modifier = Modifier.weight(1f).focusRequester(fr), singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(onDone = { onEditDone() }),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = listColor, cursorColor = listColor),
                textStyle = MaterialTheme.typography.bodyMedium)
            LaunchedEffect(Unit) { fr.requestFocus() }
        } else {
            Text(item.text, modifier = Modifier.weight(1f), fontSize = 14.sp,
                textDecoration = if (item.done) TextDecoration.LineThrough else null,
                color = if (item.done) MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                else MaterialTheme.colorScheme.onSurface)
        }
        IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
            Icon(Icons.Default.Close, null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                modifier = Modifier.size(16.dp))
        }
    }
}
