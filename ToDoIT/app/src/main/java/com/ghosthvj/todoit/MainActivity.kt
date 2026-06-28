package com.ghosthvj.todoit

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material.icons.outlined.List
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.ghosthvj.todoit.data.api.RetrofitClient
import com.ghosthvj.todoit.ui.AppViewModel
import com.ghosthvj.todoit.ui.screens.board.BoardScreen
import com.ghosthvj.todoit.ui.screens.list.ListScreen
import com.ghosthvj.todoit.ui.screens.stats.StatsScreen
import com.ghosthvj.todoit.ui.theme.ToDoITTheme

private const val PREFS_NAME = "todoit_prefs"
private const val KEY_SERVER_URL = "server_url"
private const val DEFAULT_URL = "http://10.0.2.2:3000"

sealed class Screen(val route: String) {
    data object Board : Screen("board")
    data object Stats : Screen("stats")
    data object ListDetail : Screen("list/{listId}") {
        fun buildRoute(listId: String) = "list/$listId"
    }
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Load saved server URL before the first network call
        val savedUrl = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getString(KEY_SERVER_URL, DEFAULT_URL) ?: DEFAULT_URL
        RetrofitClient.updateBaseUrl(savedUrl)

        enableEdgeToEdge()
        setContent {
            ToDoITTheme {
                ToDoItApp()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ToDoItApp() {
    val navController = rememberNavController()
    val appViewModel: AppViewModel = viewModel()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val bottomBarRoutes = listOf(Screen.Board.route, Screen.Stats.route)
    val showBottomBar = currentRoute in bottomBarRoutes

    var showServerDialog by remember { mutableStateOf(false) }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            if (showBottomBar) {
                AppTopBar(
                    currentRoute = currentRoute ?: "",
                    onSettingsClick = { showServerDialog = true },
                    onRefreshClick = { appViewModel.loadLists() }
                )
            }
        },
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    NavigationBarItem(
                        selected = currentRoute == Screen.Board.route,
                        onClick = {
                            navController.navigate(Screen.Board.route) {
                                popUpTo(Screen.Board.route) { inclusive = true }
                            }
                        },
                        icon = {
                            Icon(
                                if (currentRoute == Screen.Board.route) Icons.Filled.List else Icons.Outlined.List,
                                contentDescription = null
                            )
                        },
                        label = { Text("Mis listas") }
                    )
                    NavigationBarItem(
                        selected = currentRoute == Screen.Stats.route,
                        onClick = {
                            navController.navigate(Screen.Stats.route) {
                                popUpTo(Screen.Board.route)
                            }
                        },
                        icon = {
                            Icon(
                                if (currentRoute == Screen.Stats.route) Icons.Filled.BarChart else Icons.Outlined.BarChart,
                                contentDescription = null
                            )
                        },
                        label = { Text("Estadísticas") }
                    )
                }
            }
        }
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Board.route,
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            composable(Screen.Board.route) {
                BoardScreen(
                    appViewModel = appViewModel,
                    onNavigateToList = { listId ->
                        navController.navigate(Screen.ListDetail.buildRoute(listId))
                    }
                )
            }
            composable(
                route = Screen.ListDetail.route,
                arguments = listOf(navArgument("listId") { type = NavType.StringType })
            ) { backStackEntry ->
                val listId = backStackEntry.arguments?.getString("listId") ?: return@composable
                val lists by appViewModel.lists.collectAsState()
                val list = lists.find { it.id == listId }
                ListScreen(
                    listId = listId,
                    list = list,
                    onBack = { navController.popBackStack() }
                )
            }
            composable(Screen.Stats.route) {
                StatsScreen()
            }
        }
    }

    if (showServerDialog) {
        ServerUrlDialog(
            currentUrl = RetrofitClient.baseUrl.trimEnd('/'),
            onDismiss = { showServerDialog = false },
            onSave = { url, context ->
                RetrofitClient.updateBaseUrl(url)
                context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                    .edit()
                    .putString(KEY_SERVER_URL, url)
                    .apply()
                appViewModel.loadLists()
                showServerDialog = false
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AppTopBar(
    currentRoute: String,
    onSettingsClick: () -> Unit,
    onRefreshClick: () -> Unit
) {
    val title = when (currentRoute) {
        Screen.Board.route -> "ToDoIt"
        Screen.Stats.route -> "Estadísticas"
        else -> ""
    }
    TopAppBar(
        title = {
            Text(title, fontWeight = FontWeight.Bold, fontSize = 20.sp,
                color = MaterialTheme.colorScheme.primary)
        },
        actions = {
            if (currentRoute == Screen.Board.route) {
                IconButton(onClick = onRefreshClick) {
                    Icon(Icons.Default.Refresh, contentDescription = "Actualizar",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            IconButton(onClick = onSettingsClick) {
                Icon(Icons.Default.Settings, contentDescription = "Configuración del servidor",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    )
}

@Composable
private fun ServerUrlDialog(
    currentUrl: String,
    onDismiss: () -> Unit,
    onSave: (String, Context) -> Unit
) {
    var url by remember { mutableStateOf(currentUrl) }
    var error by remember { mutableStateOf(false) }
    val context = LocalContext.current

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Servidor", fontWeight = FontWeight.SemiBold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    "Dirección del servidor de sincronización.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                OutlinedTextField(
                    value = url,
                    onValueChange = { url = it; error = false },
                    label = { Text("URL del servidor") },
                    placeholder = { Text("https://") },
                    isError = error,
                    supportingText = if (error) ({ Text("La URL debe empezar por http:// o https://") }) else null,
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val trimmed = url.trim()
                    if (!trimmed.startsWith("http")) { error = true; return@Button }
                    onSave(trimmed, context)
                }
            ) { Text("Guardar") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancelar") }
        }
    )
}
