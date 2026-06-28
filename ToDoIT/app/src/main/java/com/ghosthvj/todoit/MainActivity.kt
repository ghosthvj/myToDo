package com.ghosthvj.todoit

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material.icons.outlined.List
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.ghosthvj.todoit.ui.AppViewModel
import com.ghosthvj.todoit.ui.screens.board.BoardScreen
import com.ghosthvj.todoit.ui.screens.list.ListScreen
import com.ghosthvj.todoit.ui.screens.stats.StatsScreen
import com.ghosthvj.todoit.ui.theme.ToDoITTheme

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

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            if (showBottomBar) {
                AppTopBar(currentRoute = currentRoute ?: "")
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
            modifier = Modifier.fillMaxSize().padding(padding)
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
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AppTopBar(currentRoute: String) {
    val title = when (currentRoute) {
        Screen.Board.route -> "ToDoIt"
        Screen.Stats.route -> "Estadísticas"
        else -> ""
    }
    TopAppBar(
        title = {
            Text(
                title,
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                color = MaterialTheme.colorScheme.primary
            )
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    )
}
