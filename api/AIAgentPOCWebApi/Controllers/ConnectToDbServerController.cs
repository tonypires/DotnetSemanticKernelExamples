using AIAgentPOCWebApi.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AIAgentPOCWebApi.Controllers
{
    [Route("api/connect")]
    [ApiController]
    public class ConnectToDbServerController : ControllerBase
    {
        private readonly ILogger<ConnectToDbServerController> _logger;
        private readonly IDataRepository _dataRepository;

        public ConnectToDbServerController(ILogger<ConnectToDbServerController> logger,
            IDataRepository dataRepository)
        {
            _logger = logger;
            _dataRepository = dataRepository;
        }

        // POST api/<ConnectToDbController>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult Post([FromBody] string value)
        {
            _logger.LogDebug(value);

            if (!_dataRepository.Connect(value))
            {
                return this.BadRequest("Cannot connect to that database.");
            }

            // Return a list of available databases
            var dbs = _dataRepository.GetAvailableDatabases(value);

            return Ok(dbs);
        }
    }
}