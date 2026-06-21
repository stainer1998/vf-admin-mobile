export type Rol = 'ADMIN' | 'TECNICO' | 'VENDEDOR'

export interface AuthUser {
  username: string
  rol: Rol
  nombre_completo: string
}

export interface LoginResponse {
  access: string
  refresh: string
  username: string
  rol: Rol
  nombre_completo: string
}

export interface GroupLight {
  id: number
  name: string
  color: string
  is_system: boolean
}

export interface Permission {
  id: number
  codename: string
  name: string
  app_label: string
  model: string
}

export interface Group {
  id: number
  name: string
  color: string
  description: string
  is_system: boolean
  user_count: number
  permissions: Permission[]
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  rol: Rol
  is_active: boolean
  is_staff: boolean
  date_joined: string
  groups: GroupLight[]
  user_permissions: Permission[]
}

export type ClientType = 'PERSON' | 'COMPANY'
export type ClientSource = 'LOOKOUT' | 'MANUAL'

export interface Client {
  id: number
  type: ClientType
  first_name: string
  last_name: string
  second_last_name: string
  identity_key: string
  phone: string
  email: string
  rut: string
  company_name: string
  address: string
  notes: string
  merged_into: number | null
  source: ClientSource
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type ClientPayload = Omit<Client, 'id' | 'identity_key' | 'created_at' | 'updated_at' | 'deleted_at'>

export type EquipmentType = 'NOTEBOOK' | 'DESKTOP' | 'AIO' | 'MINIPC'
export type DesktopSubtype = 'BRAND' | 'ASSEMBLED'

export interface Equipment {
  id: number
  client: number
  client_name: string
  type: EquipmentType
  desktop_subtype: DesktopSubtype | ''
  brand: string
  model: string
  serial_number: string
  year: number | null
  identity_key: string
  is_ambiguous: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type EquipmentPayload = Pick<
  Equipment,
  'client' | 'type' | 'desktop_subtype' | 'brand' | 'model' | 'serial_number' | 'year'
>

export type QuoteStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
export type LineType = 'SERVICE' | 'PRODUCT'

export interface Brand {
  id: number
  name: string
}

export interface ProductCategory {
  id: number
  name: string
  code_prefix: string
  is_stockable: boolean
  description: string
}

export interface Supplier {
  id: number
  name: string
  phone: string
  website: string
  address: string
  comuna: string
  city: string
  notes: string
}

export interface ProductSupplier {
  id: number
  name: string
  purchase_price: string | null
  is_preferred: boolean
}

export interface ProductSupplierWrite {
  supplier: number
  purchase_price: string | null
  is_preferred: boolean
  notes?: string
}

export interface Product {
  id: number
  code: string
  name: string
  category: number
  category_name: string
  brand: number | null
  brand_name: string
  model: string
  purchase_price: string
  sale_price: string
  margin: string | null
  stock: number
  suppliers: ProductSupplier[]
  notes: string
}

export type ProductPayload = {
  code: string
  name: string
  category: number
  brand?: number | null
  model?: string
  suppliers_write?: ProductSupplierWrite[]
  purchase_price: string
  sale_price: string
  notes?: string
}

export interface ServiceMaterial {
  id: number
  product: number
  product_name: string
  product_code: string
  sale_price: string
  purchase_price: string
  default_quantity: number
}

export interface ServiceRequiredCategory {
  id: number
  category: number
  category_name: string
  label: string
  billable: boolean
  default_quantity: number
}

export interface Service {
  id: number
  code: string
  name: string
  description: string
  sale_price: string
  direct_cost: string
  gross_profit: string
  margin: string | null
  is_active: boolean
  notes: string
  materials: ServiceMaterial[]
  required_categories: ServiceRequiredCategory[]
}

export type ServicePayload = Omit<Service, 'id' | 'gross_profit' | 'margin' | 'materials' | 'required_categories'> & {
  materials: { product: number; default_quantity: number }[]
  required_categories: { category: number; label: string; billable: boolean; default_quantity: number }[]
}

export interface InventoryMovement {
  id: number
  product: number
  product_name: string
  movement_type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT'
  quantity: number
  unit_cost: string
  date: string
  reference: string
  notes: string
}

export interface QuoteLine {
  id?: number
  line_type: LineType
  service: number | null
  product: number | null
  description: string
  unit_price: string
  unit_cost: string
  quantity: number
  subtotal?: string
}

export interface Quote {
  id: number
  folio: string
  client: number
  client_name: string
  equipment: number | null
  source_diagnosis: number | null
  date: string
  validity_days: number
  status: QuoteStatus
  iva: string
  notes: string
  subtotal: string
  total: string
  lines: QuoteLine[]
}

export interface QuoteListItem {
  id: number
  folio: string
  client: number
  client_name: string
  equipment: number | null
  date: string
  status: QuoteStatus
  subtotal: string
  total: string
}

export type WorkStatus = 'RECEIVED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED'
export type PaymentStatus = 'PENDING' | 'PAID'
export type PaymentMethod = 'TRANSFER' | 'CASH' | 'OTHER'

export type FaultType =
  | 'STORAGE' | 'SCREEN' | 'BATTERY' | 'MOTHERBOARD' | 'KEYBOARD'
  | 'RAM' | 'COOLING' | 'SOFTWARE' | 'CONNECTIVITY' | 'OTHER'

export const FAULT_TYPE_LABELS: Record<FaultType, string> = {
  STORAGE:      'Almacenamiento / disco',
  SCREEN:       'Pantalla',
  BATTERY:      'Batería',
  MOTHERBOARD:  'Placa madre',
  KEYBOARD:     'Teclado / entrada',
  RAM:          'Memoria RAM',
  COOLING:      'Sistema de enfriamiento',
  SOFTWARE:     'Software / Sistema operativo',
  CONNECTIVITY: 'Conectividad',
  OTHER:        'Otro',
}

export interface WorkOrderLine {
  id?: number
  line_type: LineType
  service: number | null
  product: number | null
  description: string
  unit_price: string
  unit_cost: string
  quantity: number
  subtotal?: string
}

export interface WorkOrder {
  id: number
  number: string
  client: number
  client_name: string
  equipment: number
  equipment_label: string
  source_quote: number | null
  intake_date: string
  delivery_date: string | null
  work_status: WorkStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod | ''
  adjustment: string
  work_description: string
  notes: string
  fault_type: FaultType | ''
  amount_charged: string
  lines: WorkOrderLine[]
}

export interface WorkOrderListItem {
  id: number
  number: string
  client: number
  client_name: string
  equipment: number
  intake_date: string
  delivery_date: string | null
  work_status: WorkStatus
  payment_status: PaymentStatus
  fault_type: FaultType | ''
  amount_charged: string
}

// ── Bitácora por equipo ────────────────────────────────────────────────────────

export interface BitacoraOTLine {
  line_type: LineType
  description: string
  quantity: number
  unit_price: string
}

export interface BitacoraOT {
  id: number
  number: string
  intake_date: string
  delivery_date: string | null
  work_status: WorkStatus
  payment_status: PaymentStatus
  amount_charged: string
  fault_type: FaultType | ''
  work_description: string
  lines: BitacoraOTLine[]
}

export interface BitacoraItemFrecuente {
  description: string
  count: number
  total: string
}

export interface BitacoraFalla {
  fault_type: FaultType
  label: string
  count: number
}

export interface EquipoBitacora {
  equipment: {
    id: number
    type: EquipmentType
    brand: string
    model: string
    serial_number: string
    year: number | null
    client_name: string
  }
  stats: {
    total_ots: number
    total_facturado: string
    primera_ot: string | null
    ultima_ot: string | null
  }
  ots: BitacoraOT[]
  servicios_frecuentes: BitacoraItemFrecuente[]
  productos_frecuentes: BitacoraItemFrecuente[]
  fallas_frecuentes: BitacoraFalla[]
}

// ── Estadísticas globales ─────────────────────────────────────────────────────

export interface EstadisticasPorMarca {
  brand: string
  count: number
}

export interface EstadisticasPorFalla {
  fault_type: FaultType
  label: string
  count: number
}

export interface EstadisticasTop {
  description: string
  count: number
  total: string
}

export interface EstadisticasPorMes {
  mes: string
  ots: number
}

export interface WorkOrderEstadisticas {
  totales: {
    ots: number
    equipos_atendidos: number
    facturado: string
  }
  por_marca: EstadisticasPorMarca[]
  por_tipo_falla: EstadisticasPorFalla[]
  servicios_top: EstadisticasTop[]
  productos_top: EstadisticasTop[]
  por_mes: EstadisticasPorMes[]
}

export interface WorkOrderDashboard {
  counts: { received: number; in_progress: number; ready: number }
  ready_list: WorkOrderListItem[]
  pending_payment: WorkOrderListItem[]
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'ADJUSTMENT'

export type ExpenseCategoryType = 'RECURRENTE' | 'VARIABLE' | 'REPUESTO'

export interface ExpenseCategory {
  id: number
  name: string
  category_type: ExpenseCategoryType
  color: string
  is_active: boolean
  order: number
}

export interface GastoRecurrente {
  id: number
  nombre: string
  descripcion: string
  monto: string | number
  categoria: number | null
  categoria_nombre: string | null
  dia_del_mes: number
  activo: boolean
}

export interface GastoRecurrenteEstado extends GastoRecurrente {
  aplicado: boolean
  vencido: boolean
}

export interface GastoPendiente {
  id: number
  descripcion: string
  monto: number
  categoria: number | null
  categoria_nombre: string | null
  work_order: number | null
  work_order_numero: string | null
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO'
  transaction: number | null
  fecha_estimada: string
  confirmado_en: string | null
  notas: string
  created_at: string
}

export interface ProyeccionMes {
  label: string
  income_proyectado: number
  expense_proyectado: number
  net_proyectado: number
  income_real?: number
  expense_real?: number
  dias_transcurridos?: number
  dias_totales?: number
}

export interface ProyeccionFlujo {
  mes_actual: ProyeccionMes & { income_real: number; expense_real: number; dias_transcurridos: number; dias_totales: number }
  proximos: ProyeccionMes[]
  base_3m: { avg_income: number; avg_expense: number; avg_net: number }
}

export interface FinancialTransaction {
  id: number
  transaction_type: TransactionType
  date: string
  amount: string
  description: string
  category: number | null
  category_name: string | null
  work_order: number | null
  inventory_movement: number | null
  created_at: string
  allocation?: {
    id: number
    details: {
      id: number
      fund: number
      fund_name: string
      percentage_applied: string
      amount: string
    }[]
  }
}

export interface FundBalance {
  fund_id: number
  fund_name: string
  color: string
  percentage: number
  balance: number
}

export interface MonthlyStat {
  month: string
  income: number
  expense: number
  adjustment: number
  net: number
}

export interface FundDistribution {
  fund_id: number
  fund_name: string
  color: string
  percentage: number
  total_credited: number
}

export interface FinanceSummary {
  monthly: MonthlyStat[]
  fund_distribution: FundDistribution[]
  current_month: {
    income: number
    expense: number
    net: number
    pending_ots_count: number
    pending_ots_amount: number
  }
}

export interface EmpresaConfig {
  nombre: string
  slogan: string
  email: string
  telefono: string
  direccion: string
  sitio_web: string
}

export type AlertaTipo =
  | 'MARGEN_BRUTO_BAJO'
  | 'GASTOS_ALTOS'
  | 'AHORRO_BAJO'
  | 'CAJA_BAJA'
  | 'CAIDA_MOM'
  | 'IMPUESTOS_INSUFICIENTES'
  | 'TICKET_CAYENDO'
  | 'OTS_PENDIENTES'

export type AlertaSeveridad = 'INFO' | 'WARNING' | 'CRITICAL'

export interface AlertaFinanciera {
  id: number
  tipo: AlertaTipo
  tipo_display: string
  severidad: AlertaSeveridad
  severidad_display: string
  mensaje: string
  fecha: string
  activa: boolean
  resuelta_en: string | null
}

export interface IndicadoresSalud {
  income_mes_actual: number
  income_mes_anterior: number
  variacion_mom: number | null
  income_3m_avg: number
  variacion_vs_3m: number | null
  ticket_promedio_mes: number
  ticket_promedio_anterior: number
  variacion_ticket: number | null
  tasa_cobro: number
  ots_sin_cobrar: number
  run_rate_anual: number
  ots_mes_total: number
  ots_mes_pagadas: number
}

export interface ReporteResumenMes {
  month: string
  income: number
  expense: number
  adjustment: number
  net: number
}

export interface ReporteTotales {
  income: number
  expense: number
  net: number
  avg_monthly_income?: number
}

export interface ReporteFondoMovimiento {
  date: string
  movement_type: 'CREDIT' | 'DEBIT'
  amount: number
  reference: string
}

export interface ReporteFondo {
  fund_id: number
  fund_name: string
  color: string
  creditos: number
  debitos: number
  neto: number
  movimientos: ReporteFondoMovimiento[]
}

export interface ReporteTransaccion {
  date: string
  transaction_type: TransactionType
  description: string
  amount: number
  work_order_id: number | null
}

export interface ReporteFinanciero {
  tipo: 'resumen' | 'fondos' | 'transacciones'
  date_from: string
  date_to: string
  // resumen
  totales?: ReporteTotales & { income: number; expense: number }
  por_mes?: ReporteResumenMes[]
  // fondos
  fondos?: ReporteFondo[]
  // transacciones
  transacciones?: ReporteTransaccion[]
}
