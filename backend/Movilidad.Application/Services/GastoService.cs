using Movilidad.Application.DTOs;
using Movilidad.Domain.Entities;
using Movilidad.Domain.Interfaces;

namespace Movilidad.Application.Services;

public sealed class GastoService(IGastoRepository repository)
{
    public async Task<IReadOnlyList<GastoDto>> ListarAsync(CancellationToken cancellationToken)
    {
        var gastos = await repository.ListarAsync(cancellationToken);
        return gastos.Select(ToDto).ToArray();
    }

    public async Task<RegistroGasto> RegistrarAsync(RegistrarGasto entrada, CancellationToken cancellationToken)
    {
        var errores = new Dictionary<string, string[]>();
        var concepto = entrada.Concepto?.Trim();
        var trabajador = entrada.Trabajador?.Trim();

        if (entrada.Fecha is null || entrada.Fecha.Value.Year < 1000)
            errores["fecha"] = ["Ingresa una fecha válida a partir del año 1000."];
        if (string.IsNullOrEmpty(concepto) || concepto.Length > Gasto.ConceptoMaximo)
            errores["concepto"] = [$"Ingresa un concepto de hasta {Gasto.ConceptoMaximo} caracteres."];
        if (string.IsNullOrEmpty(trabajador) || trabajador.Length > Gasto.TrabajadorMaximo)
            errores["trabajador"] = [$"Ingresa un trabajador de hasta {Gasto.TrabajadorMaximo} caracteres."];
        if (entrada.Monto is not (> 0 and <= Gasto.MontoMaximo) ||
            decimal.Round(entrada.Monto.Value, Gasto.DecimalesMonto) != entrada.Monto.Value)
            errores["monto"] = ["Ingresa un monto mayor que cero y menor que 10 000 000 000, con hasta dos decimales."];

        if (errores.Count > 0)
            return new RegistroGasto(null, errores);

        var gasto = new Gasto(Guid.NewGuid(), entrada.Fecha!.Value, concepto!, entrada.Monto!.Value, trabajador!);
        await repository.RegistrarAsync(gasto, cancellationToken);
        return new RegistroGasto(ToDto(gasto), errores);
    }

    public Task<bool> EliminarAsync(Guid id, CancellationToken cancellationToken) =>
        repository.EliminarAsync(id, cancellationToken);

    private static GastoDto ToDto(Gasto gasto) =>
        new(gasto.Id, gasto.Fecha, gasto.Concepto, gasto.Monto, gasto.Trabajador);
}
