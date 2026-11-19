namespace Movilidad.Domain.Entities;

public sealed record Gasto(Guid Id, DateOnly Fecha, string Concepto, decimal Monto, string Trabajador)
{
    public const int ConceptoMaximo = 200;
    public const int TrabajadorMaximo = 120;
    public const int PrecisionMonto = 12;
    public const int DecimalesMonto = 2;
    public const decimal MontoMaximo = 9_999_999_999.99m;
}
