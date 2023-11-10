using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticMemory.Handlers;
using Microsoft.SemanticMemory;

namespace AIAgentPOCWebApi.Controllers
{
    [Route("api/pdf/import")]
    [ApiController]
    public class ImportFileController : ControllerBase
    {
        public MemoryClientBuilder _memoryBuilder;
        public ISemanticMemoryClient _semanticMemory;

        public ImportFileController(
            ISemanticMemoryClient memoryClient,
            MemoryClientBuilder memoryBuilder)
        {
            _semanticMemory = memoryClient;
            _memoryBuilder = memoryBuilder;
        }

        // POST api/<ImportFileController>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ImportBody value)
        {
            if (value == null || string.IsNullOrEmpty(value.DocumentId) || string.IsNullOrEmpty(value.Filename))
            {
                this.BadRequest("Invalid parameters");
            }

            var status = await _semanticMemory.GetDocumentStatusAsync(value!.DocumentId, value.Index);
            if (status != null && status.Completed)
            {
                // Return ok as already imported
                return this.Ok();
            }

            var _ = _memoryBuilder.Build();
            var orchestrator = _memoryBuilder.GetOrchestrator();

            // Default built-in handlers explicitly specified here for the purpose of this poc
            // NOTE:  The ImportDocumentAsync method performs each of these steps implicitly
            TextExtractionHandler textExtraction = new("extract", orchestrator);
            await orchestrator.AddHandlerAsync(textExtraction);

            TextPartitioningHandler textPartitioning = new("partition", orchestrator);
            await orchestrator.AddHandlerAsync(textPartitioning);

            // This summarization handler isn't great for an api, it takes a long time for large files
            //SummarizationHandler summarizeEmbedding = new("summarize", orchestrator);
            //await orchestrator.AddHandlerAsync(summarizeEmbedding);

            GenerateEmbeddingsHandler textEmbedding = new("gen_embeddings", orchestrator);
            await orchestrator.AddHandlerAsync(textEmbedding);

            SaveEmbeddingsHandler saveEmbedding = new("save_embeddings", orchestrator);
            await orchestrator.AddHandlerAsync(saveEmbedding);

            // Add our own custom handlers to perform extra steps in the pipeline
            // orchestrator.AddHandlerAsync(...);
            // orchestrator.AddHandlerAsync(...);

            var tagsCollection = new TagCollection();
            if (value!.Tags != null)
            {
                foreach (var item in value.Tags)
                {
                    tagsCollection.Add(item.Key, item!.Value);
                }
            }

            var pipeline = orchestrator
                .PrepareNewDocumentUpload(index: value.Index, documentId: value.DocumentId, tags: tagsCollection)
                .AddUploadFile(value.Description, value.Filename, value.Filename)
                .Then("extract")
                .Then("partition")
                //.Then("summarize") // This is what slowed down ingesting a large pdf file, okay for small files
                .Then("gen_embeddings")
                .Then("save_embeddings")
                .Build();

            await orchestrator.RunPipelineAsync(pipeline);

            return this.Ok();
        }
    }

    public class ImportBody
    {
        public required string DocumentId { get; set; }
        public required string Filename { get; set; }
        public required string Index { get; set; }
        public required string Description { get; set; }
        public required Dictionary<string, List<string?>> Tags { get; set; }
    }
}