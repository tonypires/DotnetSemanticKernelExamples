using Autofac.Extensions.DependencyInjection;
using Autofac;
using Microsoft.SemanticKernel.Connectors.Memory.Sqlite;
using Microsoft.SemanticKernel.Memory;
using Microsoft.SemanticKernel.Plugins.Memory;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.AI.OpenAI;
using Microsoft.SemanticMemory;
using Microsoft.SemanticMemory.ContentStorage.DevTools;
using AIAgentPOCWebApi.Plugins;
using AIAgentPOCWebApi.Data;

namespace AIAgentPOCWebApi
{
    public class Program
    {
        private static string _model = string.Empty;
        private static string _embeddingModel = string.Empty;
        private static string _key = string.Empty;

        private static void Main(string[] args)
        {
            LoadSettings();
            Run(args);
        }

        private static void LoadSettings()
        {
            IConfiguration config = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            _key = config.GetSection("OpenAI").GetSection("key").Value!;
            _model = config.GetSection("OpenAI").GetSection("model").Value!;
            _embeddingModel = config.GetSection("OpenAI").GetSection("embeddings-model").Value!;
        }

        public static async void Run(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());

            // Add services to the container.
            builder.Services.AddControllers().AddNewtonsoftJson();
            //{
            //    // Respect the accept header to ensure json is returned
            //    opts.RespectBrowserAcceptHeader = true;
            //});

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Init kernel
            var kernel = new KernelBuilder()
                .WithOpenAIChatCompletionService(_model, _key)
                .Build();

            // Init kernel memory store
            var sqliteStore = await SqliteMemoryStore.ConnectAsync("memories.sqlite");

            var memory = new MemoryBuilder()
                .WithOpenAITextEmbeddingGenerationService(_embeddingModel, _key)
                .WithMemoryStore(sqliteStore)
                .Build();

            var semanticMemoryBuilder = new MemoryClientBuilder()
                .WithOpenAIDefaults(_key);

            var semanticMemory = semanticMemoryBuilder
                .WithSimpleFileStorage(new SimpleFileStorageConfig())
                .BuildServerlessClient();

            //var currentDirectory = AppDomain.CurrentDomain.BaseDirectory;
            //var pluginsDirectory = Path.Combine(currentDirectory, "Plugins");

            //var genSQLPlugin = kernel.ImportSemanticSkillFromDirectory(pluginsDirectory, "SQLPlugin");

            builder.Host.ConfigureContainer<ContainerBuilder>(builder =>
            {
                // Register kernel and memory
                builder.RegisterInstance(kernel).As<IKernel>();
                builder.RegisterInstance(memory).As<ISemanticTextMemory>();
                builder.RegisterInstance(sqliteStore).As<IMemoryStore>();
                builder.RegisterInstance(semanticMemoryBuilder).As<MemoryClientBuilder>();
                builder.RegisterInstance(semanticMemory).As<ISemanticMemoryClient>();

                //
                // Register plugins / skills
                //

                // Native plugin
                builder.RegisterType<GetSchemaPlugin>();

                // TODO:  Determine the best way to register semantic functions in the
                // ioc container.  For now we're registering on the fly in each endpoint.
                //builder.RegisterInstance(genSQLPlugin).As<IDictionary<string, ISKFunction>>();

                //
                // Register data repositories
                //
                builder.RegisterType<DatabaseRepository>().As<IDataRepository>();
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
                app.UseCors(x => x
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .SetIsOriginAllowed(r => true)
                    .AllowCredentials()
                );
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}