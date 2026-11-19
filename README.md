# Gastos de movilidad

Aplicación de Contabilidad para registrar, listar y eliminar gastos de movilidad sin iniciar sesión. Cada gasto guarda la fecha, el concepto, el monto y el trabajador.

## Backend local

Requiere .NET 10 y MySQL 8. Configura `ConnectionStrings__DefaultConnection` en el entorno local y ejecuta desde la raíz del repositorio.

```powershell
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet run --project backend/Movilidad.Api --urls http://localhost:5080
```

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/health` | Consulta el estado de la API |
| GET | `/api/gastos` | Lista gastos por fecha descendente |
| POST | `/api/gastos` | Registra `fecha` (AAAA-MM-DD), `concepto`, `monto` y `trabajador` |
| DELETE | `/api/gastos/{id}` | Elimina el gasto indicado |

Los cuatro campos son obligatorios. El monto debe ser positivo y admite hasta dos decimales. El backend devuelve los errores de validación por campo.

El backend selecciona `local_contabilidad`, `qa_contabilidad` o `prod_contabilidad` según el entorno. Al iniciar, crea la base de datos si no existe y aplica las migraciones en `movilidad_gastos`. EF Core conserva el historial de esta aplicación en `__EFMigrationsHistory_movilidad`.

## Frontend local

Con el backend en ejecución, usa Node.js 26 en una segunda terminal.

```powershell
Set-Location frontend
npm ci
$env:VITE_API_URL = 'http://localhost:5080'
npm run dev
```

Abre la dirección que muestra Vite. Completa el formulario para registrar un gasto y usa el botón de la fila para revisar y confirmar su eliminación.

## Contenedores

Para usar Docker Compose, configura en el entorno `MOVILIDAD_MYSQL_ROOT_PASSWORD`, `MOVILIDAD_MYSQL_USER`, `MOVILIDAD_MYSQL_PASSWORD` y `MOVILIDAD_DOCKER_CONNECTION`. Usa el host `mysql` y las credenciales del usuario MySQL de Compose en la cadena. Ejecuta `docker compose up --build` desde la raíz y abre `http://localhost:5173`.

## Verificación

Ejecuta desde la raíz del repositorio.

```powershell
dotnet test backend/Movilidad.sln
Set-Location frontend
npm test
npm run build
```

En GitHub, el workflow corporativo verifica backend y frontend antes de desplegar QA automáticamente desde `main`. Cloud Run recibe la cadena de MySQL mediante Secret Manager. El entorno de producción requiere la aprobación de TI.
