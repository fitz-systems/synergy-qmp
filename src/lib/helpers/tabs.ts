export function tabIndexForKey(key: string, index: number, count: number) {
  const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: count - 1 }
  return key in moves ? (moves[key] + count) % count : null;
}
