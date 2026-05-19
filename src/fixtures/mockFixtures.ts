/** Mock fixture library (PR 1 stand-in). Internal tool IDs are not shown in the wizard UI. */

export interface FixtureDefinition {
  id: string
  name: string
  description: string
  /** Keywords / intent tags for mock matching */
  intents: string[]
  /** User-facing labels — never expose raw tool names in the wizard */
  coveredCapabilities: string[]
  internalToolIds: string[]
  /** Serialized tool results (source of truth for this fixture) */
  mockData: string
  /** Migrated from inline persona mock data */
  isLegacy?: boolean
  isAutoMigrated?: boolean
}

export const MOCK_FIXTURES: FixtureDefinition[] = [
  {
    id: 'faq_default',
    name: 'faq_default',
    description: 'Knowledge-base FAQ responses (no external services)',
    intents: ['faq', 'pergunta', 'dúvida', 'horário', 'política', 'devolução'],
    coveredCapabilities: ['knowledge base answers'],
    internalToolIds: [],
    mockData: JSON.stringify({ tools: {} }, null, 2),
  },
  {
    id: 'handover_default',
    name: 'handover_default',
    description: 'Human handover after collecting required info',
    intents: ['humano', 'escalar', 'atendente', 'handover', 'cpf'],
    coveredCapabilities: ['human handover'],
    internalToolIds: ['renner_blip_handover_command'],
    mockData: JSON.stringify(
      { tools: { renner_blip_handover_command: { handover: true, queue: 'human_support' } } },
      null,
      2
    ),
  },
  {
    id: 'order_status_default',
    name: 'order_status_default',
    description: 'Order lookup and delivery tracking',
    intents: ['pedido', 'order', 'envío', 'enviado', 'entrega', 'tracking', '321654'],
    coveredCapabilities: ['order lookup', 'delivery tracking'],
    internalToolIds: [
      'intelipost_get_sales_order_number',
      'intelipost_get_tracking',
    ],
    mockData: JSON.stringify(
      {
        tools: {
          intelipost_get_sales_order_number: {
            order_id: '321654987321',
            status: 'shipped',
          },
          intelipost_get_tracking: { status: 'in_transit', eta: '2026-05-12' },
        },
      },
      null,
      2
    ),
  },
  {
    id: 'product_recommendation_default',
    name: 'product_recommendation_default',
    description: 'Catalog search and product recommendation (Sandbox MVP)',
    intents: ['recommendation', 'wine', 'product', 'catalog', 'cabernet', 'carrinho'],
    coveredCapabilities: ['product recommendation', 'catalog search'],
    internalToolIds: ['catalog_search', 'add_to_cart'],
    mockData: JSON.stringify(
      {
        tools: {
          catalog_search: {
            items: [
              { name: 'Cabernet Sauvignon Reserva', price: 'R$ 89,90', sku: 'WINE-CAB-001' },
              { name: 'Malbec Premium', price: 'R$ 74,50', sku: 'WINE-MAL-002' },
            ],
          },
          add_to_cart: { success: true, cart_id: 'cart_demo_1', item_count: 1 },
        },
      },
      null,
      2
    ),
  },
  {
    id: 'checkout_cep_default',
    name: 'checkout_cep_default',
    description: 'Checkout flow with CEP validation',
    intents: ['checkout', 'cep', 'carrinho', 'finalizar', 'pagamento', 'frete'],
    coveredCapabilities: ['CEP validation', 'checkout steps'],
    internalToolIds: ['checkout_validate_cep'],
    mockData: JSON.stringify(
      {
        tools: {
          checkout_validate_cep: {
            cep: '01310-100',
            city: 'São Paulo',
            street: 'Avenida Paulista',
          },
        },
      },
      null,
      2
    ),
  },
]

