using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticMemory;

namespace AIAgentPOCWebApi.Controllers
{
    [Route("api/pdf/check")]
    [ApiController]
    public class CheckDocumentExistsController : ControllerBase
    {
        public ISemanticMemoryClient _semanticMemory;

        public CheckDocumentExistsController(ISemanticMemoryClient memoryClient)
        {
            _semanticMemory = memoryClient;
        }

        // GET: api/<CheckDocumentExistsController>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Get(
            [FromQuery] string index,
            [FromQuery] string documentId)
        {
            var status = await _semanticMemory.GetDocumentStatusAsync(documentId, index);
            var response = new CheckResponse
            {
                DocumentExists = status != null && status.Completed,
                DocumentId = status?.DocumentId
            };
            return this.Ok(response);
        }
    }

    public class CheckResponse
    {
        public string? DocumentId { get; set; }
        public bool DocumentExists { get; set; }
    }
}