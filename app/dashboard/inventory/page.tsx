import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Package,
  AlertTriangle,
  TrendingDown,
  CheckCircle,
  DollarSign,
  Plus,
  ShoppingCart,
  Phone,
  MessageSquare,
  Edit,
  MoreVertical,
  Download,
  Grid3X3,
  Table,
  Search,
  Beef,
  Coffee,
  Milk,
  TrendingUp,
  Lightbulb,
  Zap,
  BarChart3,
  LineChart,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default async function InventoryPage() {
  const supabase = await createClient()

  // Obtener productos de inventario
  const { data: productos } = await supabase.from("productos_inventario").select("*").eq("activo", true).order("nombre")

  // Obtener movimientos recientes
  const { data: movimientos } = await supabase
    .from("movimientos_inventario")
    .select(`
      *,
      productos_inventario (nombre, unidad_medida),
      usuarios_horeca (nombre, apellidos)
    `)
    .order("fecha_movimiento", { ascending: false })
    .limit(10)

  // Calcular métricas
  const totalProductos = productos?.length || 0
  const productosStockCritico = productos?.filter((p) => p.stock_actual < p.stock_minimo).length || 0
  const productosStockBajo =
    productos?.filter((p) => p.stock_actual >= p.stock_minimo && p.stock_actual < p.stock_minimo * 1.5).length || 0
  const productosStockOptimo = productos?.filter((p) => p.stock_actual >= p.stock_minimo * 1.5).length || 0
  const valorTotal = productos?.reduce((acc, p) => acc + p.stock_actual * (p.precio_unitario || 0), 0) || 0

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Control de Inventario 📦</h1>
            <p className="text-emerald-100 text-lg">
              {totalProductos} productos activos • {productosStockCritico} requieren atención
            </p>
          </div>

          <div className="flex space-x-3">
            <Button className="bg-white/20 hover:bg-white/30 backdrop-blur text-white border-0">
              <Download className="mr-2 h-4 w-4" />
              Exportar Reporte
            </Button>

            <Button className="bg-white text-teal-600 hover:bg-teal-50">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-emerald-200" />
            <div className="text-2xl font-bold">{totalProductos}</div>
            <div className="text-sm text-emerald-100">Productos</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-300 animate-pulse" />
            <div className="text-2xl font-bold">{productosStockCritico}</div>
            <div className="text-sm text-emerald-100">Stock Crítico</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <TrendingDown className="h-8 w-8 mx-auto mb-2 text-orange-300" />
            <div className="text-2xl font-bold">{productosStockBajo}</div>
            <div className="text-sm text-emerald-100">Stock Bajo</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-300" />
            <div className="text-2xl font-bold">{productosStockOptimo}</div>
            <div className="text-sm text-emerald-100">Stock Óptimo</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
            <div className="text-2xl font-bold">${valorTotal.toLocaleString()}</div>
            <div className="text-sm text-emerald-100">Valor Total</div>
          </div>
        </div>
      </div>

      {/* View Toggle & Filters */}
      <div className="flex items-center justify-between">
        <Tabs defaultValue="cards" className="flex-1">
          <TabsList className="bg-white/80 backdrop-blur border-white/20">
            <TabsTrigger value="cards" className="flex items-center">
              <Grid3X3 className="mr-2 h-4 w-4" />
              Vista Tarjetas
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center">
              <Table className="mr-2 h-4 w-4" />
              Vista Tabla
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Buscar productos..." className="w-64 pl-10 bg-white/80 backdrop-blur border-white/30" />
          </div>

          <Select>
            <SelectTrigger className="w-40 bg-white/80 backdrop-blur border-white/30">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="proteinas">Proteínas</SelectItem>
              <SelectItem value="lacteos">Lácteos</SelectItem>
              <SelectItem value="bebidas_no_alcoholicas">Bebidas</SelectItem>
              <SelectItem value="granos_cereales">Granos</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-32 bg-white/80 backdrop-blur border-white/30">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
              <SelectItem value="low">Bajo</SelectItem>
              <SelectItem value="optimal">Óptimo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <TabsContent value="cards">
        {/* Inventory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos?.map((producto) => {
            const stockPercentage = (producto.stock_actual / producto.stock_minimo) * 100
            const isStockCritico = producto.stock_actual < producto.stock_minimo
            const isStockBajo =
              producto.stock_actual >= producto.stock_minimo && producto.stock_actual < producto.stock_minimo * 1.5
            const isStockOptimo = producto.stock_actual >= producto.stock_minimo * 1.5

            const getIcon = (categoria: string) => {
              switch (categoria) {
                case "proteinas":
                  return Beef
                case "bebidas_no_alcoholicas":
                  return Coffee
                case "lacteos":
                  return Milk
                default:
                  return Package
              }
            }

            const IconComponent = getIcon(producto.categoria)

            return (
              <Card
                key={producto.id}
                className={`bg-white/80 backdrop-blur shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden ${
                  isStockCritico ? "border-red-300" : isStockBajo ? "border-orange-200" : "border-green-200"
                }`}
              >
                {isStockCritico && (
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 animate-pulse"></div>
                )}

                <div className="absolute top-4 right-4">
                  <Badge
                    className={
                      isStockCritico
                        ? "bg-red-100 text-red-800 animate-pulse"
                        : isStockBajo
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                    }
                  >
                    {isStockCritico && <AlertTriangle className="mr-1 h-3 w-3" />}
                    {isStockBajo && <TrendingDown className="mr-1 h-3 w-3" />}
                    {isStockOptimo && <CheckCircle className="mr-1 h-3 w-3" />}
                    {isStockCritico ? "CRÍTICO" : isStockBajo ? "BAJO" : "ÓPTIMO"}
                  </Badge>
                </div>

                <CardContent className="p-6 relative">
                  <div className="text-center mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform ${
                        isStockCritico
                          ? "bg-gradient-to-br from-red-500 to-pink-600"
                          : isStockBajo
                            ? "bg-gradient-to-br from-orange-500 to-yellow-500"
                            : "bg-gradient-to-br from-green-500 to-emerald-600"
                      }`}
                    >
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-1">{producto.nombre}</h3>
                    <p className="text-sm text-gray-500 mb-3 capitalize">
                      {producto.categoria.replace("_", " ")} • {producto.codigo_producto}
                    </p>

                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <div
                        className={`text-3xl font-bold ${
                          isStockCritico ? "text-red-600" : isStockBajo ? "text-orange-600" : "text-green-600"
                        }`}
                      >
                        {producto.stock_actual}
                        {producto.unidad_medida}
                      </div>
                      <div className="text-sm text-gray-500">
                        / {producto.stock_minimo}
                        {producto.unidad_medida} mín
                      </div>
                    </div>
                  </div>

                  {/* Stock Progress */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Stock actual</span>
                      <span
                        className={`font-bold ${
                          isStockCritico ? "text-red-600" : isStockBajo ? "text-orange-600" : "text-green-600"
                        }`}
                      >
                        {Math.round(stockPercentage)}% del mínimo
                      </span>
                    </div>
                    <Progress
                      value={Math.min(stockPercentage, 100)}
                      className={`h-3 ${
                        isStockCritico ? "bg-red-100" : isStockBajo ? "bg-orange-100" : "bg-green-100"
                      }`}
                    />

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Mínimo: {producto.stock_minimo}
                        {producto.unidad_medida}
                      </span>
                      <span>
                        Máximo: {producto.stock_maximo}
                        {producto.unidad_medida}
                      </span>
                    </div>
                  </div>

                  {/* Critical Alert */}
                  {isStockCritico && (
                    <Alert className="mb-4 bg-red-50 border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-red-700 text-sm">
                        <strong>¡Stock crítico!</strong> Reabastecimiento urgente requerido
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Precio unitario:</span>
                      <div className="font-medium">${producto.precio_unitario}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Valor total:</span>
                      <div className="font-medium">
                        ${(producto.stock_actual * (producto.precio_unitario || 0)).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {isStockCritico ? (
                      <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Ordenar Ya
                      </Button>
                    ) : isStockBajo ? (
                      <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                        <Package className="mr-2 h-4 w-4" />
                        Planificar Pedido
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="flex-1 border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Ver Historial
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className={isStockCritico ? "border-red-200" : "border-gray-300"}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar Producto
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="mr-2 h-4 w-4" />
                          Llamar Proveedor
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          WhatsApp
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* New Product Card */}
          <Card className="bg-white/80 backdrop-blur border-dashed border-gray-300 shadow-xl hover:shadow-2xl transition-all group cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-lg font-bold text-gray-700 mb-2">Agregar Producto</h3>
                <p className="text-sm text-gray-500 mb-6">Crear nuevo item en inventario</p>

                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Producto
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Bottom Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Trends */}
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
              Tendencias de Consumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
              <div className="text-center text-gray-500">
                <LineChart className="h-12 w-12 mx-auto mb-2" />
                <p>Gráfico de Tendencias</p>
                <p className="text-sm">Consumo promedio últimos 30 días</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Suggestions */}
        <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Lightbulb className="mr-2 h-5 w-5" />
              Sugerencias IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="font-semibold">Pedido Sugerido</span>
              </div>
              <p className="text-sm text-purple-100 mb-3">Basado en consumo histórico y tendencias actuales</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Carne Molida</span>
                  <span className="font-bold">25kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Café Grano</span>
                  <span className="font-bold">10kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Tortillas</span>
                  <span className="font-bold">50 paq</span>
                </div>
              </div>
            </div>

            <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur border-0 text-white">
              <Zap className="mr-2 h-4 w-4" />
              Aplicar Sugerencias
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
