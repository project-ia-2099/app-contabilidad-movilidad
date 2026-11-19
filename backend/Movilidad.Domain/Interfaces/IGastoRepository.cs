using Movilidad.Domain.Entities;

namespace Movilidad.Domain.Interfaces;

public interface IGastoRepository
{
    Task<IReadOnlyList<Gasto>> ListarAsync(CancellationToken cancellationToken);
    Task RegistrarAsync(Gasto gasto, CancellationToken cancellationToken);
    Task<bool> EliminarAsync(Guid id, CancellationToken cancellationToken);
}
