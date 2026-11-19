using Microsoft.EntityFrameworkCore;
using Movilidad.Domain.Entities;

namespace Movilidad.Infrastructure.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Gasto> Gastos => Set<Gasto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var gasto = modelBuilder.Entity<Gasto>();
        gasto.ToTable("movilidad_gastos");
        gasto.Property(x => x.Fecha)
            .HasConversion(fecha => fecha.ToDateTime(TimeOnly.MinValue), value => DateOnly.FromDateTime(value))
            .HasColumnType("date");
        gasto.Property(x => x.Concepto).HasMaxLength(Gasto.ConceptoMaximo);
        gasto.Property(x => x.Trabajador).HasMaxLength(Gasto.TrabajadorMaximo);
        gasto.Property(x => x.Monto).HasPrecision(Gasto.PrecisionMonto, Gasto.DecimalesMonto);
    }
}
