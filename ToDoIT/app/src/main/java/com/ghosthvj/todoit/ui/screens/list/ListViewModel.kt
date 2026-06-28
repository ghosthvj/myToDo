package com.ghosthvj.todoit.ui.screens.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.ghosthvj.todoit.data.api.RetrofitClient
import com.ghosthvj.todoit.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ListViewModel(val listId: String) : ViewModel() {
    private val _tasks = MutableStateFlow<List<Task>>(emptyList())
    val tasks: StateFlow<List<Task>> = _tasks.asStateFlow()

    private val _checklistItems = MutableStateFlow<List<ChecklistItem>>(emptyList())
    val checklistItems: StateFlow<List<ChecklistItem>> = _checklistItems.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    // ── Tasks ────────────────────────────────────────────────────────────────

    fun loadTasks() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                _tasks.value = RetrofitClient.apiService.getTasks(listId)
            } catch (e: Exception) {
                _error.value = "Error al cargar las tareas"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun createTask(title: String, description: String?, priority: String, dueDate: String?, tags: String) {
        viewModelScope.launch {
            try {
                val task = RetrofitClient.apiService.createTask(
                    listId,
                    CreateTaskRequest(title, description?.ifBlank { null }, priority, dueDate?.ifBlank { null }, tags)
                )
                _tasks.value = _tasks.value + task
            } catch (e: Exception) {
                _error.value = "Error al crear la tarea"
            }
        }
    }

    fun updateTask(id: String, title: String, description: String?, priority: String, dueDate: String?, tags: String) {
        viewModelScope.launch {
            try {
                val updated = RetrofitClient.apiService.updateTask(
                    id,
                    UpdateTaskRequest(title, description?.ifBlank { null }, priority, dueDate?.ifBlank { null }, tags)
                )
                _tasks.value = _tasks.value.map { if (it.id == id) updated else it }
            } catch (e: Exception) {
                _error.value = "Error al actualizar la tarea"
            }
        }
    }

    fun toggleTask(id: String) {
        viewModelScope.launch {
            try {
                val updated = RetrofitClient.apiService.toggleTask(id)
                _tasks.value = _tasks.value.map { if (it.id == id) updated else it }
            } catch (e: Exception) {
                _error.value = "Error al actualizar la tarea"
            }
        }
    }

    fun deleteTask(id: String) {
        viewModelScope.launch {
            try {
                RetrofitClient.apiService.deleteTask(id)
                _tasks.value = _tasks.value.filter { it.id != id }
            } catch (e: Exception) {
                _error.value = "Error al eliminar la tarea"
            }
        }
    }

    // ── Checklist Items ───────────────────────────────────────────────────────

    fun loadChecklistItems() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                _checklistItems.value = RetrofitClient.apiService.getChecklistItems(listId)
            } catch (e: Exception) {
                _error.value = "Error al cargar los elementos"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun createChecklistItem(text: String) {
        viewModelScope.launch {
            try {
                val item = RetrofitClient.apiService.createChecklistItem(listId, CreateChecklistItemRequest(text))
                _checklistItems.value = _checklistItems.value + item
            } catch (e: Exception) {
                _error.value = "Error al añadir el elemento"
            }
        }
    }

    fun toggleChecklistItem(itemId: String, currentDone: Boolean) {
        viewModelScope.launch {
            try {
                val updated = RetrofitClient.apiService.updateChecklistItem(
                    listId, itemId, UpdateChecklistItemRequest(done = !currentDone)
                )
                _checklistItems.value = _checklistItems.value.map { if (it.id == itemId) updated else it }
            } catch (e: Exception) {
                _error.value = "Error al actualizar el elemento"
            }
        }
    }

    fun updateChecklistItemText(itemId: String, text: String) {
        viewModelScope.launch {
            try {
                val updated = RetrofitClient.apiService.updateChecklistItem(
                    listId, itemId, UpdateChecklistItemRequest(text = text)
                )
                _checklistItems.value = _checklistItems.value.map { if (it.id == itemId) updated else it }
            } catch (e: Exception) {
                _error.value = "Error al actualizar el elemento"
            }
        }
    }

    fun deleteChecklistItem(itemId: String) {
        viewModelScope.launch {
            try {
                RetrofitClient.apiService.deleteChecklistItem(listId, itemId)
                _checklistItems.value = _checklistItems.value.filter { it.id != itemId }
            } catch (e: Exception) {
                _error.value = "Error al eliminar el elemento"
            }
        }
    }

    fun clearError() { _error.value = null }
}

class ListViewModelFactory(private val listId: String) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        @Suppress("UNCHECKED_CAST")
        return ListViewModel(listId) as T
    }
}
