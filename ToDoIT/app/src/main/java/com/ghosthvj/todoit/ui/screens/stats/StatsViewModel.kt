package com.ghosthvj.todoit.ui.screens.stats

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ghosthvj.todoit.data.api.RetrofitClient
import com.ghosthvj.todoit.data.model.GlobalStats
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class StatsViewModel : ViewModel() {
    private val _stats = MutableStateFlow<GlobalStats?>(null)
    val stats: StateFlow<GlobalStats?> = _stats.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    fun loadStats() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                _stats.value = RetrofitClient.apiService.getStats()
            } catch (e: Exception) {
                _error.value = "No se pudieron cargar las estadísticas"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun clearError() { _error.value = null }
}
