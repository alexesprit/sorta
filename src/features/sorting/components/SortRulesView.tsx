import { Plus } from 'lucide-react'
import { SortRulesList } from '@/features/sorting/components/SortRulesList'
import {
  SORT_KEY_LABELS,
  type SortKey,
  type SortRule,
} from '@/features/sorting/utils/sortRules'

interface SortRulesViewProps {
  sortRules: SortRule[]
  onSortRulesChange: (sortRules: SortRule[]) => void
}

const availableCriteria: Array<{ key: SortKey; label: string }> = (
  Object.entries(SORT_KEY_LABELS) as Array<[SortKey, string]>
).map(([key, label]) => ({ key, label }))

export function SortRulesView({
  sortRules,
  onSortRulesChange,
}: SortRulesViewProps): JSX.Element {
  function handleToggleOrder(index: number): void {
    const newSortRules = [...sortRules]
    const rule = newSortRules[index]
    if (!rule) {
      return
    }
    const [key] = rule
    newSortRules[index] = [key, rule[1] === 'asc' ? 'desc' : 'asc']
    onSortRulesChange(newSortRules)
  }

  function handleRemove(index: number): void {
    const newSortRules = sortRules.filter((_, i) => i !== index)
    onSortRulesChange(newSortRules)
  }

  function handleAddCriterion(key: SortKey): void {
    const newRule: SortRule = [key, 'asc']
    onSortRulesChange([...sortRules, newRule])
  }

  function handleReorder(oldIndex: number, newIndex: number): void {
    const newSortRules = [...sortRules]
    const removed = newSortRules.splice(oldIndex, 1)[0]
    if (!removed) {
      return
    }
    newSortRules.splice(newIndex, 0, removed)
    onSortRulesChange(newSortRules)
  }

  const usedKeys = new Set(sortRules.map((rule) => rule[0]))
  const availableToAdd = availableCriteria.filter(
    (criterion) => !usedKeys.has(criterion.key),
  )

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 shadow-sm lg:mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Sorting Rules
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Define the logic for how tracks are ordered.
          </p>
        </div>
      </div>

      {/* Active Rules List */}
      <div className="space-y-3 mb-8 min-h-[120px]">
        <SortRulesList
          sortRules={sortRules}
          onToggleOrder={handleToggleOrder}
          onRemove={handleRemove}
          onReorder={handleReorder}
        />
      </div>

      {/* Manual Add Buttons */}
      <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-4">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 block px-1">
          Add Criterion Manually
        </span>
        {availableToAdd.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableToAdd.map(({ key, label }) => (
              <button
                type="button"
                key={key}
                onClick={() => handleAddCriterion(key)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-600 hover:text-white text-zinc-400 transition-all text-sm font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm py-2 px-1">
            All available criteria are already in use.
          </p>
        )}
      </div>
    </div>
  )
}
