using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticMemory;
using System.Text;

namespace AIAgentPOCWebApi.Controllers
{
    [Route("api/pdf/chat")]
    [ApiController]
    public class PdfChatController : ControllerBase
    {
        public ISemanticMemoryClient _semanticMemory;

        public PdfChatController(ISemanticMemoryClient semanticMemory)
        {
            _semanticMemory = semanticMemory;
        }

        // POST api/<PdfChatController>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatBody value)
        {
            // TODO:  Include chat history using the ChatClient in SK
            // For now to keep things simple we're excluding history

            var memoryFilter = new MemoryFilter();
            if (value.Tags != null && value.Tags.Count() > 0)
            {
                foreach (var item in value.Tags)
                {
                    memoryFilter.Add(item.Key, item.Value);
                }
            }

            var answer = await _semanticMemory.AskAsync(value.Question, value.Index, memoryFilter);

            var builder = new StringBuilder();
            builder.AppendLine(answer.Result);
            builder.AppendLine();
            builder.AppendLine("Sources:");
            foreach (var x in answer.RelevantSources)
            {
                builder.AppendLine($"  - {x.SourceName}  - {x.Link} [{x.Partitions.First().LastUpdate:D}]");
            }

            var memoryBuilder = new StringBuilder();

            var partitions = answer.RelevantSources.SelectMany(x => x.Partitions);

            foreach (var partition in partitions)
            {
                memoryBuilder.AppendLine("---------------------------------");
                memoryBuilder.AppendLine($"Relevance:  {partition.Relevance}%");
                memoryBuilder.AppendLine("Text:");
                memoryBuilder.AppendLine(partition.Text);
                memoryBuilder.AppendLine($"Last Updated:  {partition.LastUpdate}%");
                memoryBuilder.AppendLine("---------------------------------");
                memoryBuilder.AppendLine();
            }

            return this.Ok(new ResponseBody
            {
                Response = builder.ToString(),
                Memories = memoryBuilder.ToString()
            }); ;
        }
    }

    public class ChatBody
    {
        public required string DocumentId { get; set; }
        public required string Filename { get; set; }
        public required string Index { get; set; }
        public required string Description { get; set; }
        public required Dictionary<string, List<string?>> Tags { get; set; }
        public required string Question { get; set; }
    }

    public class ResponseBody
    {
        public string? Memories { get; set; }

        public required string Response { get; set; }
    }
}