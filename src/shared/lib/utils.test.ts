import { cn } from '@/shared/lib/utils'

describe('cn', () => {
  test('should merge class names', () => {
    const result = cn('class1', 'class2', 'class3')

    expect(result).toBe('class1 class2 class3')
  })

  test('should handle conditional classes with false values', () => {
    const result = cn('class1', false && 'class2', 'class3')

    expect(result).toBe('class1 class3')
  })

  test('should handle conditional classes with true values', () => {
    const result = cn('class1', true && 'class2', 'class3')

    expect(result).toBe('class1 class2 class3')
  })

  test('should merge Tailwind classes correctly (twMerge handles conflicts)', () => {
    // twMerge should resolve conflicts - later classes override earlier ones
    const result = cn('p-4', 'p-2')

    expect(result).toBe('p-2')
  })

  test('should merge multiple Tailwind class conflicts', () => {
    // Later classes should override earlier conflicting classes
    const result = cn('text-red-500', 'bg-blue-500', 'text-green-500')

    expect(result).toBe('bg-blue-500 text-green-500')
  })

  test('should preserve non-conflicting Tailwind classes', () => {
    const result = cn('p-4', 'bg-blue-500', 'text-white')

    expect(result).toBe('p-4 bg-blue-500 text-white')
  })

  test('should handle undefined values', () => {
    const result = cn('class1', undefined, 'class3')

    expect(result).toBe('class1 class3')
  })

  test('should handle null values', () => {
    const result = cn('class1', null, 'class3')

    expect(result).toBe('class1 class3')
  })

  test('should handle empty strings', () => {
    const result = cn('class1', '', 'class3')

    expect(result).toBe('class1 class3')
  })

  test('should handle all falsy values', () => {
    const result = cn('class1', false, null, undefined, '', 'class3')

    expect(result).toBe('class1 class3')
  })

  test('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3')

    expect(result).toBe('class1 class2 class3')
  })

  test('should handle objects with boolean values', () => {
    const result = cn({
      class1: true,
      class2: false,
      class3: true,
    })

    expect(result).toBe('class1 class3')
  })

  test('should handle mixed input types', () => {
    const result = cn(
      'base-class',
      ['array-class1', 'array-class2'],
      {
        'object-class1': true,
        'object-class2': false,
      },
      'final-class',
    )

    expect(result).toBe(
      'base-class array-class1 array-class2 object-class1 final-class',
    )
  })

  test('should handle no arguments', () => {
    const result = cn()

    expect(result).toBe('')
  })

  test('should handle complex Tailwind merge scenarios', () => {
    // Combines multiple padding classes and text sizes
    const result = cn('px-4 py-2', 'px-6', 'text-sm', 'text-lg')

    expect(result).toBe('py-2 px-6 text-lg')
  })

  test('should handle responsive Tailwind classes', () => {
    const result = cn('p-4', 'md:p-6', 'lg:p-8')

    // Responsive modifiers don't conflict with each other
    expect(result).toBe('p-4 md:p-6 lg:p-8')
  })

  test('should merge hover and focus states correctly', () => {
    const result = cn('hover:bg-blue-500', 'hover:bg-red-500', 'focus:ring-2')

    // Later hover class should override earlier one
    expect(result).toBe('hover:bg-red-500 focus:ring-2')
  })
})
