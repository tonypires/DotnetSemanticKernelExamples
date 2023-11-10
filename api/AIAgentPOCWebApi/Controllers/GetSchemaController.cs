using AIAgentPOCWebApi.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel.Orchestration;
using Microsoft.SemanticKernel;
using AIAgentPOCWebApi.Plugins;

namespace AIAgentPOCWebApi.Controllers
{
    [Route("api/getSchema")]
    [ApiController]
    public class GetSchemaController : ControllerBase
    {
        private readonly IKernel _kernel;
        private readonly IDataRepository _dataRepository;
        private readonly ILogger<GetSchemaController> _logger;
        private readonly IDictionary<string, ISKFunction> _schemaPlugin;

        public GetSchemaController(IKernel kernel,
            ILogger<GetSchemaController> logger,
            IDataRepository dataRepository,
            GetSchemaPlugin schemaPlugin)
        {
            _kernel = kernel;
            _logger = logger;
            _dataRepository = dataRepository;

            _schemaPlugin = _kernel.ImportFunctions(schemaPlugin, "GetSchemaPlugin");
        }

        // GET: api/<GetSchemaController>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Get(
            [FromQuery] string serverName,
            [FromQuery] string databaseName)
        {
            if (string.IsNullOrWhiteSpace(databaseName))
            {
                this.BadRequest("A database name query parameter is required.");
            }

            if (!_dataRepository.DatabaseExists(serverName, databaseName))
            {
                this.BadRequest("Database selected doesn't exist.");
            }

            var variables = new ContextVariables
            {
                ["serverName"] = serverName,
                ["databaseName"] = databaseName
            };

            var schema = (await _kernel.RunAsync(variables, _schemaPlugin["GetSchema"])).GetValue<string>();

            return this.Ok(schema);
        }
    }
}