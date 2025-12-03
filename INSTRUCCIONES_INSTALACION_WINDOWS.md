# 🪟 Instrucciones de Instalación para Windows

## 📋 Pasos Rápidos

### 1. Instalar Node.js
- Ve a [nodejs.org](https://nodejs.org/)
- Descarga e instala la versión LTS (recomendada: v18+)
- Reinicia tu terminal/command prompt después de la instalación

### 2. Verificar Instalación
Abre **Command Prompt** o **PowerShell** y ejecuta:
```cmd
node --version
npm --version
```
Deberías ver versiones como `v18.x.x` o superior.

### 3. Instalar pnpm (opcional pero recomendado)
```cmd
npm install -g pnpm
```

### 4. Extraer y Ejecutar la Aplicación
1. **Extrae** el archivo ZIP en tu carpeta deseada
2. **Abre** Command Prompt en esa carpeta
3. **Navega** a la carpeta de la aplicación:
   ```cmd
   cd precios-electricidad-espana
   ```
4. **Instala** dependencias:
   ```cmd
   pnpm install
   ```
   O con npm:
   ```cmd
   npm install
   ```

5. **Ejecuta** la aplicación:
   ```cmd
   pnpm dev
   ```
   O con npm:
   ```cmd
   npm run dev
   ```

6. **Abre tu navegador** en: `http://localhost:5173`

## 🎯 Instalación Automática (alternativa)

Si tienes **Git Bash** instalado, puedes usar el script automático:

```bash
bash instalar.sh
```

## 🔧 Solución de Problemas Windows

### Error: "No se puede ejecutar scripts de PowerShell"
Ejecuta PowerShell como Administrador y ejecuta:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "pnpm no se reconoce como comando"
Instala pnpm con:
```cmd
npm install -g pnpm
```

### Puerto ocupado
Vite automáticamente usará el siguiente puerto disponible (5174, 5175, etc.)

### Problemas de permisos
Ejecuta Command Prompt como Administrador si tienes problemas de permisos.

---

¡La aplicación debería funcionar perfectamente en Windows! 🎉