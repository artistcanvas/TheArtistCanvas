export function reorderByDrop<T extends { id: string }>(
  items: T[],
  draggedId: string | null,
  targetId: string
) {
  if (!draggedId || draggedId === targetId) {
    return items;
  }

  const draggedIndex = items.findIndex((item) => item.id === draggedId);
  const targetIndex = items.findIndex((item) => item.id === targetId);

  if (draggedIndex < 0 || targetIndex < 0) {
    return items;
  }

  const nextItems = [...items];
  const [draggedItem] = nextItems.splice(draggedIndex, 1);
  nextItems.splice(targetIndex, 0, draggedItem);

  return nextItems;
}

export function hasSameOrder<T extends { id: string }>(left: T[], right: T[]) {
  return left.length === right.length && left.every((item, index) => item.id === right[index]?.id);
}
