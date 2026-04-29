# ESPAÑOL

# 🕐 Proyecto Horarios - Frontend (Cliente)

> Documentación de despliegue del cliente Vue.js para el sistema de gestión de horarios escolares.

---

## 📋 Descripción

Este repositorio contiene el **Frontend** del Proyecto Horarios, una aplicación web desarrollada con **Vue.js 3** y **Vite** que permite la gestión de horarios, guardias y ausencias del profesorado.

| Tecnología | Versión |
|------------|---------|
| Vue.js | 3.x |
| Vite | 5.x |
| Node.js | v24 |
| Puerto | **5147** |

---

## ⚙️ Requisitos Previos

### 1. Configuración de Red y Docker en Windows

Antes de iniciar el despliegue, asegúrate de tener:

- **Docker Desktop** instalado y en ejecución
- **PowerShell** como terminal (no CMD)
- Puerto `5147` disponible en tu sistema

### 2. Configuración CORS (Backend) ⚠️

Para evitar errores de conexión entre el Frontend y el Backend, debes configurar el archivo CORS en el servidor:

**Archivo:** `data/servidor/app-horario/src/main/java/com/ies/poligono/sur/app/horario/security/CorsConfig.java`

```java
config.setAllowedOrigins(List.of("http://localhost:5173", "http://172.17.0.2:5173", "http://localhost:5147"));
```

> 📌 **Nota:** Añade el puerto `5147` a la lista de orígenes permitidos si no está presente.

---

## 🐳 Despliegue del Contenedor

### 1. Crear y ejecutar el contenedor del Frontend

Desde PowerShell, ejecuta el siguiente comando para crear el contenedor:

```powershell
docker run -it --name horarios-front -p 5147:5147 -v "${PWD}:/workspace" ubuntu:22.04 bash
```

> 🔄 **Si el contenedor ya existe**, usa:
> ```powershell
> docker start -ai horarios-front
> ```

### 2. Acceder al contenedor

```powershell
docker exec -it horarios-front bash
```

---

## 📦 Instalación y Ejecución dentro del Contenedor

### 1. Instalar Node.js v24

```bash
# Actualizar paquetes
apt update

# Instalar curl y software-properties-common
apt install -y curl software-properties-common

# Instalar Node.js v24
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs
```

### 2. Instalar dependencias del proyecto

```bash
# Navegar al directorio del frontend
cd /workspace/mi-horario

# Limpiar node_modules (por si hay residuos de Windows)
rm -rf node_modules

# Instalar dependencias de Linux
npm install
```

### 3. Ejecutar el servidor de desarrollo

```bash
npm run dev -- --port 5147 --host
```

> ✅ **Esperar** hasta ver el mensaje: `Local: http://localhost:5147/`


## 🛠️ Comandos Rápidos de Referencia

```bash
# Entrar al contenedor
docker exec -it horarios-front bash

# Dentro del contenedor:
cd /workspace/mi-horario

# Reinstalar dependencias (si hay problemas)
rm -rf node_modules && npm install

# Iniciar servidor
npm run dev -- --port 5147 --host
```

---

## 📞 Soporte

Para consultas sobre el despliegue o la aplicación, consulta la documentación completa del proyecto o contacta con los administradores del sistema.

---


# ENGLISH

# 🕐 Project Schedules - Frontend (Client)

> Vue.js client deployment documentation for the school timetable management system.

---

## 📋 Description

This repository contains the **Frontend** of the Schedules Project, a web application developed with **Vue.js 3** and **Vite** that allows the management of schedules, on-calls and teacher absences.

| Technology | Version |
|---------|---------|
| Vue.js | 3.x |
| Vite | 5.x |
| Node.js | v24 |
| Port | **5147** |

---

## ⚙️ Prerequisites

### 1. Network and Docker Configuration in Windows

Before starting the deployment, make sure you have:

- **Docker Desktop** installed and running
- **PowerShell** as terminal (not CMD)
- Port `5147` available on your system

### 2. CORS Configuration (Backend) ⚠️

To avoid connection errors between the Frontend and the Backend, you must configure the CORS file on the server:

**File:** `data/servidor/app-horario/src/main/java/com/ies/poligono/sur/app/horario/security/CorsConfig.java`

```java
config.setAllowedOrigins(List.of("http://localhost:5173", "http://172.17.0.2:5173", "http://localhost:5147"));
```

> 📌 **Note:** Add port `5147` to the list of allowed sources if it is not present.

---

## 🐳 Container Deployment

### 1. Create and run the Frontend container

From PowerShell, run the following command to create the container:

``powershell
docker run -it --name front-schedules -p 5147:5147 -v "${PWD}:/workspace" ubuntu:22.04 bash
```

> 🔄 **If the container already exists**, use:
> ```powershell
> docker start -ai schedules-front
> ```

### 2. Access the container

``powershell
docker exec -it schedules-front bash
```

---

## 📦 Installation and Execution inside the Container

### 1. Install Node.js v24

```bash
# Update packages
apt update

# Install curl and software-properties-common
apt install -y curl software-properties-common

# Install Node.js v24
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs
```

### 2. Install project dependencies

```bash
# Navigate to the frontend directory
cd /workspace/my-schedule

# Clean node_modules (in case there is Windows residue)
rm -rf node_modules

# Install Linux dependencies
npm install
```

### 3. Run the development server

```bash
npm run dev -- --port 5147 --host
```

> ✅ **Wait** until you see the message: `Local: http://localhost:5147/`


## 🛠️ Quick Reference Commands

```bash
# Enter the container
docker exec -it schedules-front bash

# Inside the container:
cd /workspace/my-schedule

# Reinstall dependencies (if there are problems)
rm -rf node_modules && npm install

# Start server
npm run dev -- --port 5147 --host
```

---

## 📞 Support

For deployment or application questions, see the complete project documentation or contact your system administrators.

---