using Movilidad.Application.DTOs;
using Movilidad.Application.Services;
using Movilidad.Infrastructure;
using Movilidad.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment.EnvironmentName);
builder.Services.AddScoped<GastoService>();
builder.Services.AddProblemDetails();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.AllowAnyOrigin().WithMethods("GET", "POST", "DELETE").WithHeaders("Content-Type")));

var app = builder.Build();
app.UseExceptionHandler();
app.UseCors();

await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.InicializarBaseDeDatosAsync();
}

app.MapGet("/health", () => Results.Ok(new { estado = "ok" }));

var gastos = app.MapGroup("/api/gastos");
gastos.MapGet("/", (GastoService service, CancellationToken cancellationToken) =>
    service.ListarAsync(cancellationToken));
gastos.MapPost("/", async (RegistrarGasto entrada, GastoService service, CancellationToken cancellationToken) =>
{
    var registro = await service.RegistrarAsync(entrada, cancellationToken);
    return registro.Gasto is { } gasto
        ? Results.Json(gasto, statusCode: StatusCodes.Status201Created)
        : Results.ValidationProblem(registro.Errores);
});
gastos.MapDelete("/{id:guid}", async (Guid id, GastoService service, CancellationToken cancellationToken) =>
    await service.EliminarAsync(id, cancellationToken) ? Results.NoContent() : Results.NotFound());

app.Run();

public partial class Program;
