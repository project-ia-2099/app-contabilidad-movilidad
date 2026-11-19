using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Movilidad.Application.DTOs;
using Movilidad.Infrastructure.Data;
using Xunit;

namespace Movilidad.Tests;

public sealed class GastosApiTests : IClassFixture<GastosApiFactory>
{
    private const string Gastos = "/api/gastos";
    private readonly HttpClient _client;

    public GastosApiTests(GastosApiFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task HealthDevuelveOk() =>
        Assert.Equal(HttpStatusCode.OK, (await _client.GetAsync("/health")).StatusCode);

    [Fact]
    public async Task RegistraListaYEliminaUnGasto()
    {
        var fecha = new DateOnly(2026, 11, 18);
        var post = await _client.PostAsJsonAsync(Gastos,
            new RegistrarGasto(fecha, " Taxi ", 18.50m, " Ana Pérez "));
        Assert.Equal(HttpStatusCode.Created, post.StatusCode);

        var gasto = (await post.Content.ReadFromJsonAsync<GastoDto>())!;
        Assert.Equal(new GastoDto(gasto.Id, fecha, "Taxi", 18.50m, "Ana Pérez"), gasto);
        Assert.Contains(gasto, (await _client.GetFromJsonAsync<GastoDto[]>(Gastos))!);

        Assert.Equal(HttpStatusCode.NoContent, (await _client.DeleteAsync($"{Gastos}/{gasto.Id}")).StatusCode);
        Assert.DoesNotContain(gasto, (await _client.GetFromJsonAsync<GastoDto[]>(Gastos))!);
        Assert.Equal(HttpStatusCode.NotFound, (await _client.DeleteAsync($"{Gastos}/{gasto.Id}")).StatusCode);
    }

    [Fact]
    public async Task RechazaCamposVaciosYMontosConExcesoDeDecimales()
    {
        var post = await _client.PostAsJsonAsync(Gastos, new RegistrarGasto(null, " ", 1.001m, null));
        Assert.Equal(HttpStatusCode.BadRequest, post.StatusCode);
        var problem = (await post.Content.ReadFromJsonAsync<Microsoft.AspNetCore.Mvc.ValidationProblemDetails>())!;
        Assert.Equal(4, problem.Errors.Count);
        Assert.All(new[] { "fecha", "concepto", "monto", "trabajador" },
            campo => Assert.Contains(campo, problem.Errors.Keys));
    }
}

public sealed class GastosApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IDbContextOptionsConfiguration<AppDbContext>>();
            services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase("gastos-tests"));
        });
    }
}
