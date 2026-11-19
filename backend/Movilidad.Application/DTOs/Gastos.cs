namespace Movilidad.Application.DTOs;

public sealed record RegistrarGasto(DateOnly? Fecha, string? Concepto, decimal? Monto, string? Trabajador);

public sealed record GastoDto(Guid Id, DateOnly Fecha, string Concepto, decimal Monto, string Trabajador);

public sealed record RegistroGasto(GastoDto? Gasto, Dictionary<string, string[]> Errores);
