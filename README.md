# Sistema Hospitalario de Rol de Turnos de Enfermería

Sistema web moderno y responsivo para la planificación, rotación y gestión mensual de turnos de **Licenciados en Enfermería (LE)** y **Técnicos de Enfermería (TE)** de Hospitalización (Torre Hospitalaria - 4to Piso).

---

## 📋 Reglas de Rotación Oficiales

1. **Horarios de Turno**:
   - **`MT`**: Turno Diurno (12 horas: 08:00 am a 08:00 pm).
   - **`N`**: Turno Nocturno (12 horas: 08:00 pm a 08:00 am del día siguiente).
   - **`D`**: Descanso reglamentario (3 días consecutivos libres).
   - **`VAC`** / **`DM`**: Vacaciones y Descanso Médico.

2. **Ciclo Hospitalario de 5 días**:
   $$\text{Día 1: MT (8am-8pm)} \longrightarrow \text{Día 2: N (8pm-8am)} \longrightarrow \text{Días 3, 4 y 5: Descanso Libre (3 días)}$$

3. **Requerimiento Estricto de Cobertura Diaria**:
   - **Licenciados en Enfermería**: **2 en Turno Día** y **2 en Turno Noche** cada día.
   - **Técnicos en Enfermería**: **3 en Turno Día** y **3 en Turno Noche** cada día.

---

## ✨ Características Principales

1. **☀️ Guardia de Hoy (Página Principal)**:
   - Panel de control en tiempo real con el personal en servicio hoy (Día y Noche) y quiénes descansan.
2. **📅 Rol Mensual Interactivo con Autoguardado**:
   - Selector de turnos rápido con alineación milimétrica y flecha indicadora.
   - Guardado automático e inmediato en almacenamiento local (`localStorage`).
3. **🔄 Propuesta Inteligente de Rotación desde el Día Modificado**:
   - Al editar un turno, permite proyectar el ciclo continuo (\(\text{MT} \rightarrow \text{N} \rightarrow 3\text{D}\)) desde esa fecha hasta fin de mes.
4. **🧠 Asistente Inteligente de Reemplazos**:
   - Sugiere en 1 clic al mejor candidato en descanso cuando alguien falta o sale de vacaciones, evaluando descansos previos, prevención estricta de fatiga (no 24h continuas) y balance de horas en el mes.
5. **👥 Registro de Personal**:
   - Resaltado en vivo del turno de hoy para cada colaborador con insignias y filtros inmediatos.
6. **📊 Reportes Profesionales**:
   - Exportación a **Excel (.xlsx)** con formato oficial.
   - Generación de **Reporte PDF** listo para impresión A4 con membrete institucional.
7. **📱 100% Responsivo**:
   - Optimizado para smartphones, tablets y pantallas de escritorio.

---

## 🚀 Instalación y Puesta en Marcha

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd clinica

# 2. Instalar dependencias
npm install

# 3. Iniciar en desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```
Acceso en el navegador: `http://localhost:3000`
