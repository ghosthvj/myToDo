package com.ghosthvj.todoit.data.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    var baseUrl: String = "http://10.0.2.2:3000/"
        private set

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC })
        .build()

    private var _apiService: ApiService? = null

    val apiService: ApiService
        get() = _apiService ?: buildService().also { _apiService = it }

    fun updateBaseUrl(url: String) {
        baseUrl = url.trimEnd('/') + "/"
        _apiService = buildService()
    }

    private fun buildService(): ApiService =
        Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
}
