using Microsoft.EntityFrameworkCore;
using Movilidad.Domain.Entities;
using Movilidad.Domain.Interfaces;
using Movilidad.Infrastructure.Data;

namespace Movilidad.Infrastructure.Repositories;

public sealed class GastoRepository(AppDbContext db) : IGastoRepository
{
    public async Task<IReadOnlyList<Gasto>> ListarAsync(CancellationToken cancellationToken) =>
        await db.Gastos.AsNoTracking()
            .OrderByDescending(gasto => gasto.Fecha)
            .ThenBy(gasto => gasto.Id)
            .ToListAsync(cancellationToken);

    public async Task RegistrarAsync(Gasto gasto, CancellationToken cancellationToken)
    {
        db.Gastos.Add(gasto);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> EliminarAsync(Guid id, CancellationToken cancellationToken)
    {
        var gasto = await db.Gastos.FindAsync([id], cancellationToken);
        if (gasto is null)
            return false;

        db.Gastos.Remove(gasto);

        try
        {
            await db.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            // Otro proceso ya eliminó el gasto.
            return false;
        }
    }
}
