using AIAgentPOCWebApi.Data;
using AIAgentPOCWebApi.Data.Formatters;
using AIAgentPOCWebApi.Data.Formatters.Schema;
using AIAgentPOCWebApi.Extensions;
using AIAgentPOCWebApi.Plugins;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Memory;
using Microsoft.SemanticKernel.Orchestration;
using Microsoft.SemanticKernel.Text;
using System.Text.Json;

namespace AIAgentPOCWebApi.Controllers
{
    [Route("api/learn")]
    [ApiController]
    public class LearnSchemaController : ControllerBase
    {
        private readonly ILogger<LearnSchemaController> _logger;
        private readonly IDataRepository _dataRepository;
        private readonly IKernel _kernel;
        private readonly ISemanticTextMemory _memory;
        private readonly IMemoryStore _sqliteMemory;
        private readonly IDictionary<string, ISKFunction> _schemaPlugin;

        public LearnSchemaController(
            IKernel kernel,
            ISemanticTextMemory memory,
            IMemoryStore sqliteMemory,
            IDataRepository dataRepository,
            ILogger<LearnSchemaController> logger,
            GetSchemaPlugin schemaPlugin)
        {
            _kernel = kernel;
            _memory = memory;
            _sqliteMemory = sqliteMemory;
            _logger = logger;
            _dataRepository = dataRepository;
            _schemaPlugin = kernel.ImportFunctions(schemaPlugin, "GetSchemaPlugin");
        }

        // POST api/<LearnController>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] LearnBody value)
        {
            _logger.LogDebug(value.ServerName);

            // Could directly use the repo but instead we're going to use a SK plugin to add this skill
            // to the kernel so it's available to the planner if we so choose to use it later on
            // Get the schema definition
            //_dataRepository.GetSchemaDefinition(value.ServerName, value.DatabaseName);

            var variables = new ContextVariables
            {
                ["serverName"] = value.ServerName,
                ["databaseName"] = value.DatabaseName
            };

            var schemaDefRaw = (await _kernel.RunAsync(variables, _schemaPlugin["GetSchemaDefinition"])).GetValue<string>();
            var schemaDef = JsonSerializer.Deserialize<SchemaDefinition>(schemaDefRaw!);

            // Use the sqlite connector to check whether the collection exists.
            // NOTE:  We're not using the ISemanticTextMemory instance (_memory) because it doesn't have specific support for the way
            // we want to query against Sqlite - hence the Sqlite connector.
            var collectionExists = await _sqliteMemory.DoesCollectionExistAsync(SchemaDefinition.MemoryCollectionName);

            if (!collectionExists)
            {
                await ChunkSchemaV3(schemaDef!);
            }

            return Ok(new Response
            {
                CollectionExists = collectionExists
            });
        }

        // This method converts the schema into Yaml and then chunk saves 1024 lines at a time as vector chunks
        // Problem:  A line-by-line approach to chunking in this use-case is problematic in that you'll get partial tables returned
        // for search hits
        private async Task ChunkSchemaV1(SchemaDefinition schemaDef)
        {
            var schemaDefYaml = YamlSchemaFormatter.Format(schemaDef!.Tables);
            _logger.LogDebug(schemaDefYaml);

            var response = await _memory.GetAsync(SchemaDefinition.MemoryCollectionName, schemaDef!.Name, true);

            // 1.  Chunk the yaml first
            var chunks = TextChunker.SplitPlainTextLines(schemaDefYaml, 1024);

            // 2.  Loop over each chunk and generate embeddings
            for (var i = 0; i < chunks.Count; i++)
            {
                var chunk = chunks[i];

                // Save chunk to the vector db
                _ = await _memory.SaveInformationAsync(
                       SchemaDefinition.MemoryCollectionName, // Save each chunk under the same collection name
                       chunk, // The chunk data itself as a string
                       $"{schemaDef!.Name}-Chunk{i}", // The chunk id
                       additionalMetadata: schemaDef.Platform); // Additional metadata
            }
        }

        // Create chunks of tables to vectorize
        // Caveat:  By saving in groups of tables, it means the LLM will be sent more than it needs leading to inaccurate responses
        private async Task ChunkSchemaV2(SchemaDefinition schemaDef)
        {
            var tableBlocks = schemaDef!.Tables.Batch(5);
            var index = 0;

            foreach (var block in tableBlocks)
            {
                index++;
                var batch = block.ToList();
                var batchYaml = YamlSchemaFormatter.Format(batch);
                _ = await _memory.SaveInformationAsync(
                        SchemaDefinition.MemoryCollectionName, // Save each chunk under the same collection name
                        batchYaml, // The chunk data itself as a string
                        $"{schemaDef!.Name}-Chunk{index}", // The chunk id
                        additionalMetadata: schemaDef.Platform); // Additional metadata
            }
        }

        // Create chunks of vector blocks at the table level
        // This may result in a lot of api calls but offers the best chunking method since each block is a complete table
        private async Task ChunkSchemaV3(SchemaDefinition schemaDef)
        {
            var tables = schemaDef.Tables.ToList();
            for (int i = 0; i < tables.Count(); i++)
            {
                var tbl = tables[i];
                var tblYaml = YamlSchemaFormatter.Format(tbl);
                // Save chunk to the vector db
                _ = await _memory.SaveInformationAsync(
                        SchemaDefinition.MemoryCollectionName, // Save each chunk under the same collection name
                        tblYaml, // The chunk data itself as a string
                        $"{schemaDef!.Name}-Chunk{i}", // The chunk id
                        additionalMetadata: schemaDef.Platform); // Additional metadata
            }
        }
    }

    public class LearnBody
    {
        public required string ServerName { get; set; }

        public required string DatabaseName { get; set; }
    }

    public class Response
    {
        public bool CollectionExists { get; set; }
    }
}