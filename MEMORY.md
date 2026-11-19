# MEMORY.md - Fuente de Verdad del Proyecto

> **Instrucción para el Agente:** Este archivo es la **Fuente de Verdad** del proyecto. Todo plan aprobado por el usuario debe registrarse aquí antes de su implementación, y el estado de cada tarea debe actualizarse conforme avance el proyecto. No avances a la siguiente tarea sin haber completado la anterior.

---

## 1. Contexto y Arquitectura Base Aprobada
- **Propósito:** Plantilla corporativa Golden Path (`app_template_fullstack`) para desarrollo asistido por IA (Vicoders) bajo gobernanza de TI.
- **Stack Oficial:**
  - **Frontend:** React + TypeScript + Vite + Vitest sobre **Node.js 26 LTS**.
  - **Backend:** C# `.NET 10` (`net10.0`) Minimal APIs + Entity Framework Core + `xUnit` en **Clean Architecture** (`Domain`, `Application`, `Infrastructure`, `Api`, `Tests`).
  - **Base de Datos (MySQL — 1 BD por Área y Entorno + Prefijo por App):**
    - **Áreas oficiales permitidas:** `contabilidad`, `rrhh`, `sistemas`, `comercial`, `almacen` (cualquier otra área debe solicitarse a TI).
    - **Local:** MySQL local (`local_<area>`, configurada una sola vez en `ConnectionStrings__DefaultConnection`).
    - **QA (GCP Cloud SQL):** `qa_<area>` usando cadena base desde **GCP Secret Manager** (`db-connection-string-qa:latest`) y `ASPNETCORE_ENVIRONMENT=QA`.
    - **Producción (GCP Cloud SQL):** `prod_<area>` usando cadena base desde **GCP Secret Manager** (`db-connection-string-prod:latest`) y `ASPNETCORE_ENVIRONMENT=Production` (con aprobación de `888Leonidas888`).
  - **Despliegue:** GitHub Actions hacia **Google Cloud Run** (`qa` automático y `production` protegido con aprobación obligatoria de `888Leonidas888`).

---

## 2. Reglas Operativas Activas
1. **Conventional Commits v1.0.0** en todos los commits.
2. **Cero commits directos en `main`** (trabajo exclusivo en ramas `feat/*`, `fix/*`, `docs/*`, `chore/*`, `refactor/*`).
3. **Pull Request obligatorio** vía `gh pr create`; **prohibido fusionar a `main`** sin instrucción explícita del usuario.
4. **Secuencialidad:** Terminar y verificar cada tarea antes de pasar a la siguiente.
5. **Cero archivos basura** y **cero exposición de datos sensibles**.
6. **Principio DRY** y **cero fallbacks silenciosos** (preguntar al usuario ante cualquier duda técnica).
7. **Sincronización documental:** Actualizar `README.md` y `MEMORY.md` en cada entrega.

---

## 3. Historial de Planes y Estado de Tareas

### Plan Inicial: Configuración del Template Corporativo (`app_template_fullstack`)
- [x] **Tarea 1:** Crear estructura documental del template (`README.md`, `plan.md`, `AGENTS.md`, `.gitignore`) y pipeline `.github/workflows/ci-cd.yml` con Node 26 LTS y `.NET 10`.
- [x] **Tarea 2:** Configurar reglas de ingeniería (`.agents/rules/golden-path-rules.md`, `.github/copilot-instructions.md`), inicializar `MEMORY.md` y crear las Skills operativas en `.agents/skills/`.
- [x] **Tarea 3:** Aprobar y fusionar el Pull Request #1 de reglas y skills hacia `main`.
- [x] **Tarea 4:** Separar bases de datos por entorno (`VicoderLocalDb` en local, `BooksDb_QA` con `db-connection-string-qa` para QA, `BooksDb_Prod` con `db-connection-string-prod` para Producción), instalar Skill Global `init-vicoder-project` y asignar a `888Leonidas888` como Revisor Obligatorio en `production`.
- [x] **Tarea 5:** Corregir referencia directa a la imagen Docker del backend en el job `deploy-prod` de `.github/workflows/ci-cd.yml` para evitar que GitHub Actions filtre el output por contener `secrets.GCP_PROJECT_ID`.
- [x] **Tarea 6:** Automatizar la publicación de enlaces oficiales de QA y Producción en el resumen de GitHub Actions (`$GITHUB_STEP_SUMMARY`) y en la skill `git-pr-workflow`.
- [x] **Tarea 7:** Establecer convención oficial de nombres de repositorios (`app-<area>-<nombre>`, máx. 35 caracteres) y aislamiento por esquemas SQL + Migraciones EF Core (`HasDefaultSchema` / `MigrationsHistoryTable`) para compartir la misma base de datos entre áreas.
- [x] **Tarea 8:** Exigir lógica de negocio 100% en Backend (preparado para futura unificación por microservicios) y estandarizar el Frontend con Design System Minimalista Pastel, Font Awesome Free y cero emoticones Unicode.
- [x] **Tarea 9:** Migrar gobernanza de base de datos a **MySQL** (1 BD por área `<entorno>_<area>` + prefijo `<nombre>_` en tablas y `__EFMigrationsHistory_<nombre>`), restringir áreas permitidas a `contabilidad`, `rrhh`, `sistemas`, `comercial`, `almacen` y explicitar `ASPNETCORE_ENVIRONMENT` en `ci-cd.yml`.


### Plan aprobado: Registro de gastos de movilidad (Contabilidad)

- [x] Implementar y verificar el backend Clean Architecture en .NET 10: registrar, listar y eliminar gastos sin login. Cada gasto tiene Fecha, Concepto, Monto y Trabajador.
- [x] Implementar y verificar el frontend React con TypeScript, Font Awesome Free y diseño minimalista pastel.
- [x] Verificar el flujo contra MySQL local y ejecutar dotnet test (5 pruebas), npm test (4 pruebas) y npm run build. Verificar en Edge el registro, listado y eliminación en escritorio y móvil.
- [x] Actualizar README.md y preparar la entrega de feat/initial-app.
- La fusión autorizada y el despliegue de QA se registran en los [pull requests](https://github.com/project-ia-2099/app-contabilidad-movilidad/pulls?q=is%3Apr) y las [ejecuciones de main](https://github.com/project-ia-2099/app-contabilidad-movilidad/actions/workflows/ci-cd.yml?query=branch%3Amain).

La fecha se conserva como DATE en MySQL, con conversión explícita en EF Core para mantener DateOnly en el dominio y la API. La validación de campos y montos corresponde al backend.

