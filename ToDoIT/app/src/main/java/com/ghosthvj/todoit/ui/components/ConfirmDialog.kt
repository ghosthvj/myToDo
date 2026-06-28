package com.ghosthvj.todoit.ui.components

import androidx.compose.material3.*
import androidx.compose.runtime.Composable

@Composable
fun ConfirmDialog(
    title: String,
    message: String,
    confirmLabel: String = "Eliminar",
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = { Text(message) },
        confirmButton = {
            Button(
                onClick = { onConfirm(); onDismiss() },
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
            ) { Text(confirmLabel) }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancelar") }
        }
    )
}
