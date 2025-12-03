# ⚡ Aplicación de Optimización de Precios de Electricidad - España

## 📋 Descripción
Aplicación web para consultar y optimizar el precio de la electricidad en España en tiempo real. Muestra precios horarios, identifica horas baratas/caras, y planifica el uso de electrodomésticos para ahorrar dinero.

## 🚀 Instalación Rápida

### Prerrequisitos
- **Node.js** (versión 18 o superior)
- **pnpm** (gestor de paquetes, recomendado) o npm

### Pasos de Instalación

1. **Instala pnpm si no lo tienes:**
   ```bash
   npm install -g pnpm
   ```

2. **Instala las dependencias:**
   ```bash
   pnpm install
   ```
   
   O si prefieres npm:
   ```bash
   npm install
   ```

3. **Ejecuta la aplicación en modo desarrollo:**
   ```bash
   pnpm dev
   ```
   
   O con npm:
   ```bash
   npm run dev
   ```

4. **Abre tu navegador:**
   - Ve a: `http://localhost:5173`
   - ¡La aplicación debería cargarse automáticamente!

## 🏗️ Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Ejecutar en modo desarrollo (hot reload) |
| `pnpm build` | Construir para producción |
| `pnpm preview` | Previsualizar la build de producción |
| `pnpm lint` | Verificar código con ESLint |

## 📱 Funcionalidades

### ✅ Dashboard Principal
- **Precios en tiempo real** desde API oficial REE
- **Gráfico interactivo** de 24 horas
- **Selector Hoy/Mañana** funcional
- **Top 3 horas** más baratas y caras
- **Tabla de precios** con colores semánticos

### ✅ Planificador de Electrodomésticos
- **Añadir aparatos** (lavadora, lavavajillas, etc.)
- **Configurar restricciones** horarias
- **Algoritmo de optimización** para horarios
- **Cálculo de ahorros** estimados

### ✅ Optimización Móvil
- **Diseño responsive** para móviles
- **Touch-friendly** con botones grandes
- **Navegación intuitiva** por pestañas
- **Interfaz en español** clara y sencilla

## 🔧 Tecnologías Utilizadas

- **React 18** + TypeScript
- **Vite** (build tool rápida)
- **Tailwind CSS** (estilos modernos)
- **Radix UI** (componentes accesibles)
- **Recharts** (gráficos interactivos)
- **React Hook Form** (manejo de formularios)

## 🌐 API Integrada

La aplicación utiliza la **API oficial de Red Eléctrica de España (REE)**:
- URL: `https://apidatos.ree.es`
- Datos en tiempo real de precios horarios
- Información del mercado eléctrico español
- Sin autenticación requerida

## 💾 Almacenamiento Local

Las configuraciones de electrodomésticos se guardan en el **localStorage del navegador**:
- No requiere registro de usuario
- Datos persisten entre sesiones
- Solo se almacena en tu dispositivo

## 🐛 Solución de Problemas

### Error de dependencias
```bash
# Limpia e instala de nuevo
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Error de permisos en Linux/Mac
```bash
# Instala con sudo si es necesario
sudo pnpm install
```

### Puerto ocupado
```bash
# Vite usa el puerto 5173 por defecto
# Si está ocupado, se usará automáticamente el siguiente puerto libre
```

### La API no carga
- Verifica tu conexión a internet
- Las APIs de REE pueden tener momentos de inactividad
- La aplicación maneja errores automáticamente

## 📁 Estructura del Proyecto

```
precios-electricidad-espana/
├── src/
│   ├── components/     # Componentes React
│   ├── context/        # Estado global
│   ├── lib/           # Utilidades
│   ├── types/         # Tipos TypeScript
│   └── App.tsx        # Componente principal
├── public/            # Archivos estáticos
├── docs/              # Documentación
└── package.json       # Dependencias y scripts
```

## 🤝 Contribuciones

Este proyecto está completo y funcional. Si encuentras algún problema:

1. Verifica que tienes Node.js 18+
2. Asegúrate de usar `pnpm install` o `npm install`
3. Reinicia el servidor con `pnpm dev`

## 📞 Soporte

La aplicación está completamente desarrollada y lista para usar. Sigue las instrucciones de arriba para instalarla y ejecutarla en tu entorno local.

¡Disfruta optimizando tu consumo eléctrico y ahorrando dinero! ⚡💰

---

**Aplicación desarrollada por MiniMax Agent**
*Fecha: Diciembre 2025*