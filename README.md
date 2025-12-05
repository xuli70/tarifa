# Tarifa - Optimizador de Consumo Eléctrico

Aplicación web para optimizar el consumo eléctrico en España. Muestra los precios horarios de la electricidad en tiempo real desde Red Eléctrica de España (REE) y ayuda a programar electrodomésticos en las horas más baratas.

## Características

- **Precios en tiempo real**: Obtiene precios horarios de la API oficial de REE
- **Gráfico interactivo de precios**: Barras con degradados, alturas proporcionales, franjas horarias (madrugada, mañana, tarde, noche), tooltips y línea de media
- **Clasificación de precios**: Barato (verde), Normal (ámbar), Caro (rojo)
- **Top horas**: Muestra las 3 mejores y peores horas del día
- **Planificador de electrodomésticos**: Programa tus aparatos en las horas más económicas
- **Optimización automática**: Calcula el mejor horario respetando restricciones de tiempo
- **PWA**: Funciona offline y se puede instalar como aplicación

## Tecnologías

- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **Estilos**: Tailwind CSS + Radix UI
- **Estado**: React Context + useReducer
- **Formularios**: React Hook Form + Zod
- **API**: Red Eléctrica de España (REE)

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/xuli70/tarifa.git
cd tarifa

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

## Scripts

```bash
pnpm dev          # Servidor de desarrollo (puerto 5173)
pnpm build        # Build de producción
pnpm build:prod   # Build de producción (modo prod)
pnpm preview      # Vista previa del build
pnpm lint         # Ejecutar ESLint
pnpm clean        # Limpiar node_modules y cache
```

## Despliegue con Docker

```bash
# Construir imagen
docker build -t tarifa .

# Ejecutar contenedor
docker run -p 80:80 tarifa
```

## Estructura del Proyecto

```
src/
├── components/
│   ├── dashboard/    # Visualización de precios (PriceChart, CurrentPriceCard, TopHoursCard)
│   ├── planner/      # Planificador de electrodomésticos
│   ├── settings/     # Configuración de usuario
│   ├── layout/       # Layout y navegación
│   └── ui/           # Componentes base
├── hooks/            # Custom hooks (useAppState)
├── services/         # Servicios API (reeApi, optimizationService)
├── types/            # Definiciones TypeScript
└── lib/              # Utilidades
```

## Demo

Disponible en: https://tarifa.axcsol.com

## Licencia

MIT
