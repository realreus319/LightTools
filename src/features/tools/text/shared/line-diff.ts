export type DiffOperation = {
  type: 'same' | 'add' | 'remove'
  line: string
}

const MAX_DIFF_LINES = 500
const MAX_DIFF_CHARACTERS = 100_000

export function diffLines(left: string, right: string): DiffOperation[] {
  if (left.length + right.length > MAX_DIFF_CHARACTERS) {
    throw new RangeError('Diff input is too large')
  }

  const a = left.split(/\r?\n/)
  const b = right.split(/\r?\n/)
  if (a.length > MAX_DIFF_LINES || b.length > MAX_DIFF_LINES) {
    throw new RangeError('Diff input has too many lines')
  }

  const matrix = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1))
  for (let leftIndex = a.length - 1; leftIndex >= 0; leftIndex -= 1) {
    const row = matrix[leftIndex]
    const nextRow = matrix[leftIndex + 1]
    if (!row || !nextRow) continue
    for (let rightIndex = b.length - 1; rightIndex >= 0; rightIndex -= 1) {
      row[rightIndex] =
        a[leftIndex] === b[rightIndex]
          ? (nextRow[rightIndex + 1] ?? 0) + 1
          : Math.max(nextRow[rightIndex] ?? 0, row[rightIndex + 1] ?? 0)
    }
  }

  const operations: DiffOperation[] = []
  let leftIndex = 0
  let rightIndex = 0
  while (leftIndex < a.length && rightIndex < b.length) {
    if (a[leftIndex] === b[rightIndex]) {
      operations.push({ type: 'same', line: a[leftIndex] ?? '' })
      leftIndex += 1
      rightIndex += 1
    } else if (
      (matrix[leftIndex + 1]?.[rightIndex] ?? 0) >= (matrix[leftIndex]?.[rightIndex + 1] ?? 0)
    ) {
      operations.push({ type: 'remove', line: a[leftIndex] ?? '' })
      leftIndex += 1
    } else {
      operations.push({ type: 'add', line: b[rightIndex] ?? '' })
      rightIndex += 1
    }
  }
  while (leftIndex < a.length) {
    operations.push({ type: 'remove', line: a[leftIndex] ?? '' })
    leftIndex += 1
  }
  while (rightIndex < b.length) {
    operations.push({ type: 'add', line: b[rightIndex] ?? '' })
    rightIndex += 1
  }
  return operations
}
