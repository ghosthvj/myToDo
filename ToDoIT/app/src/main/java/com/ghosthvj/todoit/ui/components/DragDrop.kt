package com.ghosthvj.todoit.ui.components

import androidx.compose.foundation.gestures.detectDragGesturesAfterLongPress
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.input.pointer.pointerInput

class DragDropState(
    val listState: LazyListState,
    private val onSwap: (Int, Int) -> Unit
) {
    var draggingIndex by mutableStateOf<Int?>(null)
        private set
    var dragOffset by mutableStateOf(0f)
        private set

    fun isDragging(index: Int) = draggingIndex == index
    fun translationY(index: Int) = if (draggingIndex == index) dragOffset else 0f
    fun zIndex(index: Int) = if (draggingIndex == index) 1f else 0f

    fun onDragStart(offset: Offset) {
        val scrollOffset = listState.firstVisibleItemScrollOffset
        val adjusted = offset.y + scrollOffset - listState.layoutInfo.viewportStartOffset
        listState.layoutInfo.visibleItemsInfo
            .firstOrNull { adjusted.toInt() in it.offset..(it.offset + it.size) }
            ?.also {
                draggingIndex = it.index
                dragOffset = 0f
            }
    }

    fun onDrag(offset: Offset) {
        dragOffset += offset.y
        checkSwap()
    }

    fun onDragEnd() {
        draggingIndex = null
        dragOffset = 0f
    }

    private fun checkSwap() {
        val idx = draggingIndex ?: return
        val item = listState.layoutInfo.visibleItemsInfo.firstOrNull { it.index == idx } ?: return
        val center = item.offset + item.size / 2 + dragOffset.toInt()
        val target = listState.layoutInfo.visibleItemsInfo
            .filter { it.index != idx }
            .firstOrNull { center in it.offset..(it.offset + it.size) }
        if (target != null) {
            onSwap(idx, target.index)
            dragOffset += item.offset - target.offset
            draggingIndex = target.index
        }
    }
}

@Composable
fun rememberDragDropState(listState: LazyListState, onSwap: (Int, Int) -> Unit): DragDropState =
    remember(listState) { DragDropState(listState, onSwap) }

fun Modifier.dragGestures(state: DragDropState, onDragEnd: () -> Unit): Modifier =
    this.pointerInput(state) {
        detectDragGesturesAfterLongPress(
            onDragStart = { offset -> state.onDragStart(offset) },
            onDrag = { _, offset -> state.onDrag(offset) },
            onDragEnd = { state.onDragEnd(); onDragEnd() },
            onDragCancel = { state.onDragEnd() }
        )
    }
