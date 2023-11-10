using AIAgentPOCWebApi.Data.Formatters.Schema;
using AIAgentPOCWebApi.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel;
using AIAgentPOCWebApi.Data.Formatters;
using Microsoft.SemanticKernel.Memory;
using Microsoft.SemanticKernel.Orchestration;

namespace AIAgentPOCWebApi.Controllers
{
    [Route("api/generateSQL")]
    [ApiController]
    public class GenerateSQLController : ControllerBase
    {
        private readonly ILogger<GenerateSQLController> _logger;
        private readonly IDataRepository _dataRepository;
        private readonly IKernel _kernel;
        private readonly ISemanticTextMemory _memory;
        private readonly IMemoryStore _sqliteMemory;

        public GenerateSQLController(
            IKernel kernel,
            ISemanticTextMemory memory,
            IMemoryStore sqliteMemory,
            ILogger<GenerateSQLController> logger,
            IDataRepository dataRepository)
        {
            _kernel = kernel;
            _memory = memory;
            _sqliteMemory = sqliteMemory;
            _logger = logger;
            _dataRepository = dataRepository;
        }

        // POST api/<GenerateSQLController>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Post([FromBody] PromptBody value)
        {
            _logger.LogDebug(value.ServerName);

            var results = new List<MemoryQueryResult>();

            var preamble = _dataRepository.GetBasicSchemaDefinition(value.ServerName, value.DatabaseName);
            var preambleSerialized = YamlSchemaFormatter.Format(preamble);

            await foreach (var answer in _memory.SearchAsync(
                SchemaDefinition.MemoryCollectionName, value.Prompt, 2, minRelevanceScore: 0.7, withEmbeddings: true))
            {
                results.Add(answer);
            }

            if (!results.Any())
            {
                return this.Ok(new ResponseBody
                {
                    Memories = string.Empty,
                    Response = "Unfortunately no memories were found that are relevant to this question, please try rephrase the request."
                });
            }

            var serializedSchema = string.Join(' ', results.Select(x => x.Metadata.Text));

            //var lines = TextChunker.SplitPlainTextLines(serializedSchema, 300);
            //var paragraphs = TextChunker.SplitPlainTextParagraphs(lines, 2040 / 2, 200);

            //var tokens = GPT3Tokenizer.Encode(serializedSchema).Count;
            //if (tokens >= 4000)
            //{
            //}

            var contextVariables = new ContextVariables
            {
                ["preamble"] = preambleSerialized,
                ["tables"] = serializedSchema,
                ["input"] = value.Prompt
            };

            var currentDirectory = AppDomain.CurrentDomain.BaseDirectory;
            var pluginsDirectory = Path.Combine(currentDirectory, "Plugins");
            var genSQLPlugin = _kernel.ImportSemanticFunctionsFromDirectory(pluginsDirectory, "SQLPlugin");

            try
            {
                var response = (await _kernel.RunAsync(contextVariables, genSQLPlugin["GenerateSQL"])).GetValue<string>();

                return this.Ok(new ResponseBody
                {
                    Response = response!,
                    Memories = YamlSchemaFormatter.Format(results.Select(x => x.Metadata.Text).ToList())
                });
            }
            catch (Exception ex)
            {
                return this.BadRequest(ex.Message);
            }
        }

        public class PromptBody
        {
            public required string ServerName { get; set; }
            public required string DatabaseName { get; set; }
            public required string Prompt { get; set; }
        }

        public class ResponseBody
        {
            public required string Memories { get; set; }

            public required string Response { get; set; }
        }
    }
}