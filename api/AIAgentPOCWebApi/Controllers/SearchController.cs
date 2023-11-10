using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticMemory;

namespace AIAgentPOCWebApi.Controllers
{
    [Route("api/search")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        public ISemanticMemoryClient _semanticMemory;

        public SearchController(ISemanticMemoryClient semanticMemory)
        {
            _semanticMemory = semanticMemory;
        }

        // POST api/<SearchController>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] SearchBody value)
        {
            if (value == null)
            {
                return this.BadRequest("Given parameter value is invalid");
            }

            var memoryFilter = new MemoryFilter();
            if (value.Tags != null && value.Tags.Count() > 0)
            {
                foreach (var item in value.Tags)
                {
                    memoryFilter.Add(item.Key, item.Value);
                }
            }

            var result = await _semanticMemory.SearchAsync(value.SearchQuery, value.Index, memoryFilter, limit: 10);

            return this.Ok(new ResponseBody
            {
                Query = result.Query,
                Results = result.Results.ToArray()
            });
        }

        public class ResponseBody
        {
            public required string Query { get; set; }

            public required Citation[] Results { get; set; }
        }

        public class SearchBody
        {
            public required string DocumentId { get; set; }
            public required string Filename { get; set; }
            public required string Index { get; set; }
            public required string Description { get; set; }
            public required Dictionary<string, List<string?>> Tags { get; set; }
            public required string SearchQuery { get; set; }
        }
    }
}