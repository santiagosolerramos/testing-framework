export type RunEntry =
  | { type: 'user'; text: string }
  | { type: 'assistant'; text: string }
  | { type: 'callback'; label: string }
  | { type: 'product'; name: string; price: string }
