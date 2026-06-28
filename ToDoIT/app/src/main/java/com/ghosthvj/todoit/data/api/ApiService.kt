package com.ghosthvj.todoit.data.api

import com.ghosthvj.todoit.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // Lists
    @GET("api/lists")
    suspend fun getLists(): List<TaskList>

    @POST("api/lists")
    suspend fun createList(@Body request: CreateListRequest): TaskList

    @PATCH("api/lists/{id}")
    suspend fun updateList(@Path("id") id: String, @Body request: UpdateListRequest): TaskList

    @DELETE("api/lists/{id}")
    suspend fun deleteList(@Path("id") id: String): Response<Unit>

    // Tasks (nested under lists)
    @GET("api/lists/{listId}/tasks")
    suspend fun getTasks(
        @Path("listId") listId: String,
        @Query("sort") sort: String? = null,
        @Query("order") order: String? = null,
        @Query("status") status: String? = null
    ): List<Task>

    @POST("api/lists/{listId}/tasks")
    suspend fun createTask(@Path("listId") listId: String, @Body request: CreateTaskRequest): Task

    @PATCH("api/tasks/{id}")
    suspend fun updateTask(@Path("id") id: String, @Body request: UpdateTaskRequest): Task

    @DELETE("api/tasks/{id}")
    suspend fun deleteTask(@Path("id") id: String): Response<Unit>

    @PATCH("api/tasks/{id}/toggle")
    suspend fun toggleTask(@Path("id") id: String): Task

    // Checklist items
    @GET("api/checklists/{listId}/items")
    suspend fun getChecklistItems(@Path("listId") listId: String): List<ChecklistItem>

    @POST("api/checklists/{listId}/items")
    suspend fun createChecklistItem(@Path("listId") listId: String, @Body request: CreateChecklistItemRequest): ChecklistItem

    @PATCH("api/checklists/{listId}/items/{itemId}")
    suspend fun updateChecklistItem(
        @Path("listId") listId: String,
        @Path("itemId") itemId: String,
        @Body request: UpdateChecklistItemRequest
    ): ChecklistItem

    @DELETE("api/checklists/{listId}/items/{itemId}")
    suspend fun deleteChecklistItem(@Path("listId") listId: String, @Path("itemId") itemId: String): Response<Unit>

    // Stats
    @GET("api/stats")
    suspend fun getStats(): GlobalStats
}
