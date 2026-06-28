package com.ghosthvj.todoit.data.model

import com.google.gson.annotations.SerializedName

data class TaskList(
    val id: String,
    val name: String,
    val color: String,
    val icon: String? = null,
    val type: String = "TASK",
    val sortOrder: Int = 0,
    val createdAt: String = "",
    val updatedAt: String = "",
    val tasks: List<TaskRef>? = null,
    @SerializedName("_count") val count: TaskCount? = null
) {
    val pendingCount: Int get() = tasks?.size ?: 0
    val totalCount: Int get() = count?.tasks ?: 0
}

data class TaskRef(val id: String)
data class TaskCount(val tasks: Int)

data class Task(
    val id: String,
    val listId: String,
    val title: String,
    val description: String? = null,
    val status: String = "PENDING",
    val priority: String = "MEDIUM",
    val dueDate: String? = null,
    val tags: String = "",
    val manualOrder: Int = 0,
    val completedAt: String? = null,
    val createdAt: String = "",
    val updatedAt: String = ""
) {
    val tagList: List<String> get() = if (tags.isBlank()) emptyList() else tags.split(",").map { it.trim() }.filter { it.isNotEmpty() }
    val isCompleted: Boolean get() = status == "COMPLETED"
}

data class ChecklistItem(
    val id: String,
    val listId: String,
    val text: String,
    val done: Boolean = false,
    val sortOrder: Int = 0,
    val createdAt: String = "",
    val updatedAt: String = ""
)

data class GlobalStats(
    val total: Int = 0,
    val completed: Int = 0,
    val pending: Int = 0,
    val inProgress: Int = 0,
    val completionRate: Double = 0.0,
    val dueSoon: Int = 0,
    val overdue: Int = 0,
    val byList: List<ListStat> = emptyList(),
    val byPriority: List<PriorityStat> = emptyList(),
    val activity: List<ActivityDay> = emptyList()
)

data class ListStat(
    val id: String,
    val name: String,
    val color: String,
    val total: Int,
    val completed: Int,
    val pending: Int
)

data class PriorityStat(
    val priority: String,
    val count: Int
)

data class ActivityDay(
    val date: String,
    val count: Int
)

// Request bodies
data class CreateListRequest(val name: String, val color: String, val type: String, val icon: String? = null)
data class UpdateListRequest(val name: String? = null, val color: String? = null)
data class CreateTaskRequest(
    val title: String,
    val description: String? = null,
    val priority: String = "MEDIUM",
    val dueDate: String? = null,
    val tags: String = ""
)
data class UpdateTaskRequest(
    val title: String? = null,
    val description: String? = null,
    val priority: String? = null,
    val dueDate: String? = null,
    val tags: String? = null,
    val status: String? = null
)
data class CreateChecklistItemRequest(val text: String)
data class UpdateChecklistItemRequest(val text: String? = null, val done: Boolean? = null)
