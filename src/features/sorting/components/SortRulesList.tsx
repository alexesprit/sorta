import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowDown, ArrowUp, GripVertical, ListFilter, X } from 'lucide-react'
import type { SortRule } from '@/features/sorting/utils/sortRules'
import { getSortKeyName } from '@/features/sorting/utils/sortRules'
import { EmptyState } from '@/shared/components/ui/empty-state'

interface SortRulesListProps {
  sortRules: SortRule[]
  onToggleOrder: (index: number) => void
  onRemove: (index: number) => void
  onReorder: (oldIndex: number, newIndex: number) => void
}

interface SortableRuleItemProps {
  sortRule: SortRule
  index: number
  onToggleOrder: (index: number) => void
  onRemove: (index: number) => void
}

function SortableRuleItem({
  sortRule,
  index,
  onToggleOrder,
  onRemove,
}: SortableRuleItemProps): JSX.Element {
  const [sortKey, sortOrder] = sortRule
  const label = getSortKeyName(sortKey)
  const isAscending = sortOrder === 'asc'

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${sortKey}-${index}` })

  const style: React.CSSProperties = {
    ...(transform && {
      transform: CSS.Transform.toString(transform) as string,
    }),
    ...(transition && { transition }),
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 animate-fade-in"
    >
      <div className="flex-shrink-0 w-6 flex justify-center text-zinc-600 text-xs font-mono">
        {index + 1}
      </div>
      <div className="flex-1 flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-sm group hover:border-zinc-600 transition-colors">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4 text-zinc-600" />
          </button>
          <div className="inline-flex items-center rounded-full border border-transparent bg-zinc-800 text-zinc-50 px-2.5 py-0.5 text-xs font-semibold">
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleOrder(index)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-zinc-800 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {isAscending ? (
              <>
                Ascending
                <ArrowUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Descending
                <ArrowDown className="w-3 h-3" />
              </>
            )}
          </button>
          <div className="w-px h-4 bg-zinc-800 mx-1"></div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-500 text-zinc-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function SortRulesList({
  sortRules,
  onToggleOrder,
  onRemove,
  onReorder,
}: SortRulesListProps): JSX.Element {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  if (sortRules.length === 0) {
    return (
      <EmptyState
        icon={ListFilter}
        title="No rules applied yet"
        description="Add sorting rules to organize your playlists"
      />
    )
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sortRules.findIndex(
        (_, i) => `${sortRules[i]?.[0]}-${i}` === active.id,
      )
      const newIndex = sortRules.findIndex(
        (_, i) => `${sortRules[i]?.[0]}-${i}` === over.id,
      )

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex)
      }
    }
  }

  const items = sortRules.map((sortRule, index) => `${sortRule[0]}-${index}`)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {sortRules.map((sortRule, index) => (
            <SortableRuleItem
              key={`${sortRule[0]}-${index}`}
              sortRule={sortRule}
              index={index}
              onToggleOrder={onToggleOrder}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
