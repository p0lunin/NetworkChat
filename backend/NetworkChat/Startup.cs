using System.Net.Mime;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;
using NetworkChat.Infrastructure;
using NetworkChat.Repositories;
using NetworkChat.Services;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace NetworkChat
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
            using (var client = new Models.NetworkChatContext())
            {
                client.Database.EnsureCreated();
            }
            IdentityModelEventSource.ShowPII = true;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.RegisterOpenApiGenerator();
            services.AddEntityFrameworkSqlite().AddDbContext<Models.NetworkChatContext>();
            services
                .AddTransient<IUsersRepository, UsersRepository>()
                .AddTransient<IChatRepository, ChatsRepository>()
                .AddTransient<IUpdatesRepository, UpdatesRepository>()
                .AddTransient<IFileService, FileService>()
                .AddTransient<IUpdatesService, UpdatesService>()
                .AddTransient<IOnlinesService, OnlinesService>()
                .AddTransient<IChatService, ChatService>()
                .AddTransient<IUserService, UserService>()
                .AddTransient<ISessionService, SessionService>();

            services
                .AddAuthentication(x =>
                {
                    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
                {
                    options.RequireHttpsMetadata = false;
                    options.SaveToken = true;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes("MySecrettttttttt!")),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                    };
                });
                //.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options => Configuration.Bind("CookieSettings", options));

            services.AddMvc()
                .AddNewtonsoftJson(options =>
                {
                    options.SerializerSettings.NullValueHandling = NullValueHandling.Include;
                    options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
                    options.SerializerSettings.DateTimeZoneHandling = DateTimeZoneHandling.Utc;
                    options.SerializerSettings.ContractResolver = new DefaultContractResolver();
                });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            /*
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            */
            app.UseExceptionHandler(errorApp =>
            {
                errorApp.Run(async context =>
                {
                    var exceptionHandlerPathFeature =
                        context.Features.Get<IExceptionHandlerPathFeature>();

                    string text = exceptionHandlerPathFeature?.Error switch
                    {
                        UserNotFoundException e => "User not found",
                        UserNotHaveEnoughRightsException e => "User not have enough rights",
                        UserAlreadyInChatException e => "User already in chat",
                        ChatNotFoundException e => "Chat not found",
                        UsernameAlreadyExistsException e => "Username already exists",
                        _ => "Unknown error"
                    };
                    context.Response.ContentType = MediaTypeNames.Application.Json;
                    context.Response.StatusCode = 400;
                    await context.Response.WriteAsync(JsonConvert.SerializeObject(new ApiError { Error = text }));
                });
            });

            app.UseOpenApi(settings =>
            {
                settings.Path = $"{ApiConstant.Prefix}openapi/swagger.json";
                settings.DocumentName = "openapi";
            });

            app.UseSwaggerUi3(options =>
            {
                options.Path = $"{ApiConstant.Prefix}openapi";
                options.DocumentPath = $"{ApiConstant.Prefix}openapi/swagger.json";
            });

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
