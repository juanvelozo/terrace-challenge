# 📊 Orderbook Viewer

Aplicación web en tiempo real para visualizar el order book (libro de órdenes) de criptomonedas desde la API de Binance.

## 🚀 Características

- ✅ **Visualización en tiempo real** del order book con actualización automática cada 3 segundos
- ✅ **Indicador de spread** con métricas de liquidez (diferencia entre mejor bid y ask)
- ✅ **Barras de volumen** proporcionales para visualizar la profundidad del mercado
- ✅ **Ordenamiento por volumen** para identificar rápidamente los niveles de mayor liquidez
- ✅ **Tabs separadas** para Bids (compra) y Asks (venta)
- ✅ **Selector dinámico** para ajustar la cantidad de órdenes (10-100)
- ✅ **Server-Side Rendering** para mejor performance y SEO
- ✅ **Optimizaciones de React** (memorización, callbacks, componentes puros)
- ✅ **Type-safe** con TypeScript
- ✅ **Responsive** y con modo oscuro

## 🛠️ Tecnologías

- **Framework:** [Next.js 15](https://nextjs.org) con App Router
- **UI Library:** [HeroUI](https://heroui.com) (componentes modernos)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **API:** Binance REST API
- **Estado:** React Hooks (useState, useEffect, useCallback, useMemo)
- **Arquitectura:** Server Components + Client Components + Server Actions

## Bitácora
Bueno, la idea era consumir un endpoint para obtener los parámetros para consumir el otro endpoint. Fácil ¿No?. Primero empecé visitando los endpoints para ver la estructura de datos y así convertirla a TypeScript. Después hice un cliente genérico del fetch de NextJS, como una especie de Axios pero custom y liviano. Esto lo usé para hacer un servicio de Binance donde metí todas las llamadas a su API pública. 

Con la UI partí de un Select dropdown, quise usar Hero UI para evitar pensar qué aspecto tendrían los componentes. Ese dropdown está disponible al hacer fetch de todas las currencies. Al elegir una opción, se hace el segundo fetch y muestra una tabla con los datos. A partir de acá fui agregando funcionalidad como el refectch cada ciertos segundos, para el cual usé un circular progress y mucha lógica de timers (le agregué lógica de resetear e incluso pausar, ahora explico este último). Después, agregué otro dropdown para elegir la cantidad de filas que muestra la tabla. El tema es que la tabla se renderizaba de nuevo cuando se actualizaba cada 3 segundos. De acá viene la lógica de pausar. Para darle al usuario tiempo de usar el dropdown de cantidad de filas, hice que el contador de actualización se pause al abrir este dropdown. Después, hice una Card de "liquidez", no me compliqué mucho, mostré un porcentaje haciendo un cálculo entre el valor más alto de las dos tablas y mostré abajo el bid y el ask más alto. Esto está dentro del componente que se actualiza en tiempo real así que los datos también se actualizan. Después, me fui a las developer tools de chrome a ver si había algo que mejorar. Solo un large content y algo de accesibilidad. el máximo de carga de página que me habrá dado fue 150ms, nada mal. 

Cuando ya tenía esto listo, decidí separar de forma marcada la data, poniendo las tablas de forma separada en dos pestañas distintas, así de paso aprovechaba más la librería de HeroUI. Luego, le presté atención a la key de volumen, y tuve la idea de hacer un gráfico, pero era demasiado engorroso y la UI iba a quedar muy cargada, así que simplemente puse un progress con porcentaje en una de las celdas de la tabla. Después de esto un poco de lógica de optimización para ordenar el array por el volumen más alto al más bajo, y ya quedó. Después decidí poner explícitamente el tiempo de respuesta en la UI para evidenciar la optimización del aplicativo.

Obstáculos:
- Quise conectarme por WebSocket pero la verdad nunca lo logré, siempre se quedaba colgado. La IA no pudo resolverlo tampoco. 

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── actions/
│   │   └── binanceActions.ts          # Server Actions para fetch del order book
│   ├── components/
│   │   ├── Providers.tsx              # Provider de HeroUI
│   │   ├── RegresiveCount/            # Countdown circular con auto-refresh
│   │   ├── ResponseTime/              # Chip para mostrar tiempo de respuesta
│   │   ├── Select/                    # Select genérico type-safe
│   │   ├── SpreadIndicator/           # Card con métricas de spread
│   │   └── SymbolSelect/              # Componente principal del order book
│   ├── layout.tsx                     # Layout raíz con providers
│   └── page.tsx                       # Página home (Server Component)
├── lib/
│   ├── apiClient.ts                   # Cliente HTTP genérico con Next.js fetch
│   └── api.types.ts                   # Tipos para el API client
├── services/
│   └── binance.service.ts             # Servicio específico para Binance API
└── types/
    ├── bidsAsks.ts                    # Tipos para order book
    └── Symbols.ts                     # Tipos para exchange info
```

## 🚦 Instalación y Uso

### Requisitos previos

- Node.js 18+ 
- npm, yarn, pnpm o bun

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>

# Instalar dependencias
npm install
# o
yarn install
# o
pnpm install
```

### Desarrollo

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build para producción

```bash
npm run build
npm start
```

## 🎯 Características Técnicas

### API Client Genérico
Cliente HTTP reutilizable que aprovecha las extensiones de `fetch` de Next.js:
- ISR (Incremental Static Regeneration)
- Cache tags
- Revalidación automática
- Manejo de errores robusto

### Server Actions
Comunicación cliente-servidor sin endpoints explícitos:
- Mantiene SSR sin perder interactividad
- Type-safe de extremo a extremo
- Optimizado para INP (Interaction to Next Paint)

### Optimizaciones de React
- **Memoización** con `useCallback`, `useMemo`, `memo`
- **Componentes separados** con responsabilidad única
- **Keys únicas** para mejor reconciliación
- **Cálculos pesados optimizados** (procesamiento de bids/asks)

### Performance
- **LCP optimizado**: Contenido crítico fuera de Suspense
- **ISR**: Cache de exchange info por 6 horas
- **Suspense boundaries**: Loading states apropiados
- **Auto-refresh inteligente**: Pausa durante interacción del usuario

## 🔄 Flujo de Datos

1. **Initial Load (SSR):**
   - Server Component obtiene lista de símbolos
   - ISR cachea la respuesta por 6 horas
   
2. **Selección de símbolo:**
   - Client Component llama a Server Action
   - Se obtiene order book con límite seleccionado
   - Datos se actualizan en tiempo real

3. **Auto-refresh:**
   - Countdown de 3 segundos
   - Se pausa al abrir selector de límite
   - Se resetea al cambiar símbolo o límite

## 📊 Componentes Principales

### SymbolSelect
Componente principal que maneja:
- Selección de símbolo
- Fetch del order book vía Server Action
- Auto-refresh con countdown
- Estados de loading/refetching

### OrderBookView
Componente memoizado que renderiza:
- Tablas de Bids y Asks con tabs
- Barras de progreso para volumen
- Ordenamiento por volumen
- Selector de límite de órdenes

### SpreadIndicator
Card con métricas de liquidez:
- Spread absoluto y porcentual
- Precio medio
- Mejores bid y ask
- Indicador visual de liquidez