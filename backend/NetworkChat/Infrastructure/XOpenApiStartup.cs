using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using NJsonSchema.Generation;
using NSwag;
using NSwag.Generation;
using NSwag.Generation.Processors.Security;

namespace NetworkChat.Infrastructure
{
    public static class XOpenApiStartup
    {
        public static IServiceCollection RegisterOpenApiGenerator(
            this IServiceCollection services)
        {
            return services.AddOpenApiDocument(settings =>
            {
                settings.Version = "v1";
                settings.DocumentName = "openapi";
                settings.Title = "My project";
                settings.DefaultResponseReferenceTypeNullHandling = ReferenceTypeNullHandling.NotNull;

                settings.AddBearerTokenAuth();
            });
        }
        
        private static void AddBearerTokenAuth(this OpenApiDocumentGeneratorSettings settings)
        {
            var securityName = "Bearer";
            settings.AddSecurity(securityName, Enumerable.Empty<string>(), new OpenApiSecurityScheme
            {
                Type = OpenApiSecuritySchemeType.ApiKey,
                Name = "Authorization",
                In = OpenApiSecurityApiKeyLocation.Header,
                Description = "Type into the textbox: Bearer {your auth token}."
            });
                
            settings.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor(securityName));
        }
    }
}