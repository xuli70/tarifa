# 📦 Archivo ZIP: Aplicación de Precios de Electricidad España

## 🎯 ¿Qué incluye este ZIP?

### ✅ Aplicación React Completa
- **Código fuente** completo de la aplicación
- **Todas las dependencias** especificadas en package.json
- **Configuración** de Vite, TypeScript, Tailwind CSS
- **Componentes UI** modernos y responsivos

### ✅ Documentación Completa
- `README_INSTALACION.md` - Instrucciones generales
- `INSTRUCCIONES_INSTALACION_WINDOWS.md` - Guía específica para Windows
- `instalar.sh` - Script de instalación automática para Linux/Mac

### ✅ Funcionalidades Incluidas
- Integración con **API oficial REE** de España
- **Gráficos interactivos** de precios por horas
- **Planificador de electrodomésticos** con optimización
- **Diseño móvil** responsive optimizado
- **Interfaz en español** completa
- **Almacenamiento local** para configuraciones

## 🚀 Pasos Rápidos de Instalación

### Para Windows:
1. **Extrae** el ZIP en tu carpeta deseada
2. **Instala Node.js** desde [nodejs.org](https://nodejs.org/)
3. **Abre Command Prompt** en la carpeta extraída
4. **Navega** a `precios-electricidad-espana/`
5. **Instala dependencias**: `npm install`
6. **Ejecuta**: `npm run dev`
7. **Abre** [http://localhost:5173](http://localhost:5173)

### Para Linux/Mac:
1. **Extrae** el ZIP
2. **Abre terminal** en la carpeta extraída
3. **Ejecuta**: `bash instalar.sh`
4. **Abre** [http://localhost:5173](http://localhost:5173)

## 📱 Funcionalidades Principales

### 📊 Dashboard
- **Precios en tiempo real** de REE España
- **Gráfico de 24 horas** interactivo
- **Selector hoy/mañana** funcional
- **Top 3 horas** más baratas/caras

### 🔌 Planificador
- **Añadir electrodomésticos** (lavadora, lavavajillas, etc.)
- **Configurar restricciones** horarias
- **Algoritmo de optimización** automática
- **Cálculo de ahorros** estimados

### 📱 Móvil-First
- **Diseño responsive** para pantallas pequeñas
- **Touch-friendly** con botones grandes
- **Navegación intuitiva** por pestañas
- **Interfaz moderna** y accesible

## 🛠️ Tecnologías Incluidas

- **React 18** + TypeScript
- **Vite** (build tool ultrarrápida)
- **Tailwind CSS** (estilos modernos)
- **Radix UI** (componentes accesibles)
- **Recharts** (gráficos interactivos)
- **React Hook Form** (formularios)

## 🌐 API Utilizada

La aplicación se conecta a la **API oficial de Red Eléctrica de España**:
- **URL**: `https://apidatos.ree.es`
- **Datos reales** de precios horarios
- **Actualizaciones** en tiempo real
- **Sin autenticación** requerida

## 💾 Almacenamiento

Las configuraciones se guardan en **localStorage** del navegador:
- **Sin registro** de usuario necesario
- **Datos persistentes** entre sesiones
- **Solo en tu dispositivo**

## 🔧 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Ejecutar en desarrollo |
| `npm run build` | Construir para producción |
| `npm run preview` | Previsualizar build |
| `npm run lint` | Verificar código |

## 📁 Estructura del Proyecto

```
precios-electricidad-espana/
├── src/
│   ├── components/     # Componentes React
│   │   ├── dashboard/  # Pantalla principal
│   │   ├── planner/    # Planificador
│   │   ├── settings/   # Configuración
│   │   └── ui/         # Componentes base
│   ├── services/       # API y lógica
│   ├── hooks/          # React hooks
│   ├── types/          # Tipos TypeScript
│   └── lib/            # Utilidades
├── public/             # Archivos estáticos
├── package.json        # Dependencias
└── Documentación/      # Instrucciones
```

## 🐛 Solución de Problemas

### Error de Node.js
- Verifica que tienes Node.js 18+ instalado
- Reinicia terminal después de instalar Node.js

### Error de dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

### La aplicación no carga
- Verifica que el puerto 5173 esté libre
- Vite automáticamente usará el siguiente puerto disponible

### La API no responde
- Verifica tu conexión a internet
- Las APIs de REE pueden tener momentos de inactividad

## 🎉 ¡Todo Listo!

Una vez instalado, tendrás una aplicación completamente funcional para:
- ✅ Consultar precios de electricidad en tiempo real
- ✅ Identificar las horas más baratas del día
- ✅ Planificar el uso de electrodomésticos
- ✅ Optimizar tu consumo eléctrico y ahorrar dinero

---

**Desarrollado por MiniMax Agent**  
*Aplicación completa y lista para usar*