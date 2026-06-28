package com.ghosthvj.todoit.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ghosthvj.todoit.data.api.RetrofitClient
import com.ghosthvj.todoit.data.model.CreateListRequest
import com.ghosthvj.todoit.data.model.TaskList
import com.ghosthvj.todoit.data.model.UpdateListRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AppViewModel : ViewModel() {
    private val _lists = MutableStateFlow<List<TaskList>>(emptyList())
    val lists: StateFlow<List<TaskList>> = _lists.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        loadLists()
    }

    fun loadLists() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                _lists.value = RetrofitClient.apiService.getLists()
            } catch (e: Exception) {
                _error.value = "No se pudo conectar al servidor"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun getList(id: String): TaskList? = _lists.value.find { it.id == id }

    fun createList(name: String, color: String, type: String, onSuccess: () -> Unit = {}) {
        viewModelScope.launch {
            try {
                RetrofitClient.apiService.createList(CreateListRequest(name, color, type))
                loadLists()
                onSuccess()
            } catch (e: Exception) {
                _error.value = "Error al crear la lista"
            }
        }
    }

    fun updateList(id: String, name: String, color: String, onSuccess: () -> Unit = {}) {
        viewModelScope.launch {
            try {
                val updated = RetrofitClient.apiService.updateList(id, UpdateListRequest(name, color))
                _lists.value = _lists.value.map { if (it.id == id) updated else it }
                onSuccess()
            } catch (e: Exception) {
                _error.value = "Error al actualizar la lista"
            }
        }
    }

    fun deleteList(id: String, onSuccess: () -> Unit = {}) {
        viewModelScope.launch {
            try {
                RetrofitClient.apiService.deleteList(id)
                _lists.value = _lists.value.filter { it.id != id }
                onSuccess()
            } catch (e: Exception) {
                _error.value = "Error al eliminar la lista"
            }
        }
    }

    fun clearError() { _error.value = null }
}
