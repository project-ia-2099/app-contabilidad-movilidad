using Movilidad.Application.Services;
using Movilidad.Domain.Entities;
using Xunit;

namespace Movilidad.Tests;

public sealed class ArchitectureTests
{
    [Fact]
    public void DomainSoloUsaBibliotecasDelFramework()
    {
        Assert.All(typeof(Gasto).Assembly.GetReferencedAssemblies(),
            reference => Assert.StartsWith("System.", reference.Name));
    }

    [Fact]
    public void ApplicationSoloDependeDeDomainYDelFramework()
    {
        var references = typeof(GastoService).Assembly.GetReferencedAssemblies()
            .Where(reference => !reference.Name!.StartsWith("System."))
            .Select(reference => reference.Name);
        Assert.Equal(["Movilidad.Domain"], references);
    }
}
