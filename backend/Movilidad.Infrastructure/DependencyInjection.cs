using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Movilidad.Domain.Interfaces;
using Movilidad.Infrastructure.Data;
using Movilidad.Infrastructure.Repositories;
using MySql.Data.MySqlClient;

namespace Movilidad.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration configuration, string environment)
    {
        services.AddDbContext<AppDbContext>(options =>
        {
            var database = environment switch
            {
                "Development" => "local_contabilidad",
                "QA" => "qa_contabilidad",
                "Production" => "prod_contabilidad",
                _ => throw new InvalidOperationException($"Entorno de MySQL desconocido: {environment}.")
            };
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(connectionString))
                throw new InvalidOperationException("Configura ConnectionStrings__DefaultConnection para usar MySQL.");

            var connection = new MySqlConnectionStringBuilder(connectionString) { Database = database };
            options.UseMySQL(connection.ConnectionString,
                mysql => mysql.MigrationsHistoryTable("__EFMigrationsHistory_movilidad"));
        });
        services.AddScoped<IGastoRepository, GastoRepository>();
        return services;
    }

    public static async Task InicializarBaseDeDatosAsync(this AppDbContext db)
    {
        if (!db.Database.IsRelational())
            return;

        var connection = new MySqlConnectionStringBuilder(db.Database.GetConnectionString());
        var database = connection.Database;
        connection.Database = "";

        await using var server = new MySqlConnection(connection.ConnectionString);
        await server.OpenAsync();
        await using var command = server.CreateCommand();
        command.CommandText = $"CREATE DATABASE IF NOT EXISTS `{database}` CHARACTER SET utf8mb4";
        await command.ExecuteNonQueryAsync();
        await db.Database.MigrateAsync();
    }
}
