package com.ghosthvj.todoit.ui.components

import androidx.compose.foundation.gestures.detectDragGesturesAfterLongPress
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
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

    /** The index is known from the item that owns the gesture modifier. */
    fun onDragStart(index: Int) {
        draggingIndex = index
        dragOffset = 0f
    }

    fun onDrag(deltaY: Float) {
        dragOffset += deltaY
        checkSwap()
    }

    fun onDragEnd() {
        draggingIndex = null
        dragOffset = 0f
    }

    private fun checkSwap() {
        val idx = draggingIndex ?: return
        val draggingItem = listState.layoutInfo.visibleItemsInfo
            .firstOrNull { it.index == idx } ?: return

        // Center of the dragged item in its current visual position
        val draggingCenter = draggingItem.offset + draggingItem.size / 2 + dragOffset

        val target = listState.layoutInfo.visibleItemsInfo
            .firstOrNull { item ->
                item.index != idx &&
                    draggingCenter.toInt() in item.offset..(item.offset + item.size)
            } ?: return

        onSwap(idx, target.index)
        // Compensate the offset so the dragged item stays under the finger
        dragOffset += (draggingItem.offset - target.offset).toFloat()
        draggingIndex = target.index
    }
}

@Composable
fun rememberDragDropState(listState: LazyListState, onSwap: (Int, Int) -> Unit): DragDropState =
    remember(listState) { DragDropState(listState, onSwap) }

/**
 * Attach to each reorderable item. [index] is the item's current index in the list,
 * so the drag always starts on the right element regardless of where it is touched.
 *
 * The gesture detector is keyed on [Unit] (not [index]) so an in-progress drag is not
 * cancelled when a swap changes this item's index. The latest [index] and [onDragEnd]
 * are read through [rememberUpdatedState] to avoid stale captures.
 */
fun Modifier.dragGestures(
    state: DragDropState,
    index: Int,
    onDragEnd: () -> Unit
): Modifier = composed {
    val currentIndex by rememberUpdatedState(index)
    val currentOnDragEnd by rememberUpdatedState(onDragEnd)
    pointerInput(Unit) {
        detectDragGesturesAfterLongPress(
            onDragStart = { state.onDragStart(currentIndex) },
            onDrag = { change, dragAmount ->
                change.consume()
                state.onDrag(dragAmount.y)
            },
            onDragEnd = { state.onDragEnd(); currentOnDragEnd() },
            onDragCancel = { state.onDragEnd() }
        )
    }
}
