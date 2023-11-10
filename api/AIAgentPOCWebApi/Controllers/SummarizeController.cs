using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Orchestration;
using Microsoft.SemanticKernel.Text;
using Microsoft.SemanticMemory;
using Microsoft.SemanticMemory.DataFormats.Pdf;
using Microsoft.SemanticMemory.Handlers;
using Microsoft.SemanticMemory.Pipeline;
using System.Text;
using static Microsoft.SemanticMemory.Pipeline.DataPipeline;

namespace AIAgentPOCWebApi.Controllers
{
    [Route("api/summarize")]
    [ApiController]
    public class SummarizeController : ControllerBase
    {
        public ISemanticMemoryClient _semanticMemory;
        private readonly IKernel _kernel;
        public MemoryClientBuilder _memoryBuilder;

        public SummarizeController(ISemanticMemoryClient semanticMemory, IKernel kernel, MemoryClientBuilder memoryClientBuilder)
        {
            _semanticMemory = semanticMemory;
            _kernel = kernel;
            _memoryBuilder = memoryClientBuilder;
        }

        // POST api/<SummarizeController>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] InputParam value)
        {
            var memoryFilter = new MemoryFilter();
            if (value.Tags != null && value.Tags.Count() > 0)
            {
                foreach (var item in value.Tags)
                {
                    memoryFilter.Add(item.Key, item.Value);
                }
            }

            var currentDirectory = AppDomain.CurrentDomain.BaseDirectory;
            var pluginsDirectory = Path.Combine(currentDirectory, "Plugins");
            var plugins = _kernel.ImportSemanticFunctionsFromDirectory(pluginsDirectory, "SummarizePlugin");

            _ = _memoryBuilder.Build();
            var orchestrator = _memoryBuilder.GetOrchestrator();

            var pipeline = await orchestrator.ReadPipelineStatusAsync(value.Index, value.DocumentId);
            var summarizedContent = string.Empty;

            if (pipeline != null && pipeline.Complete)
            {
                summarizedContent = await GetSummarizedContent(value, orchestrator, pipeline!);
            }

            if (string.IsNullOrEmpty(summarizedContent))
            {
                if (System.IO.File.Exists(string.Format("{0}-summarized.txt", value.Filename)))
                {
                    summarizedContent = await System.IO.File.ReadAllTextAsync(string.Format("{0}-summarized.txt", value.Filename));
                }
                else
                {
                    var decoder = new PdfDecoder();
                    var content = decoder.DocToText(value.Filename);
                    var lines = TextChunker.SplitPlainTextLines(content, 300);
                    var paragraphs = TextChunker.SplitPlainTextParagraphs(lines, 2040 / 2, 200);

                    var buffer = new StringBuilder();

                    foreach (var p in paragraphs.Take(10))
                    {
                        var context = new ContextVariables
                        {
                            ["input"] = p
                        };

                        var result = (await _kernel.RunAsync(context, plugins["Summarize"])).GetValue<string>();

                        buffer.Append(result);
                        buffer.AppendLine();
                    }

                    summarizedContent = buffer.ToString();

                    await System.IO.File.WriteAllTextAsync(string.Format("{0}-summarized.txt", value.Filename), summarizedContent, Encoding.UTF8).ConfigureAwait(false);
                }
            }

            if (value.Action == "SUMMARIZE")
            {
                return this.Ok(new ResponseBody
                {
                    Response = summarizedContent
                });
            }
            else
            {
                var context = new ContextVariables
                {
                    ["input"] = summarizedContent
                };

                string? result;
                switch (value.Action)
                {
                    case "KEYPOINTS":
                        result = (await _kernel.RunAsync(context, plugins["KeyPoints"])).GetValue<string>();
                        return this.Ok(new ResponseBody
                        {
                            Response = result ?? "No key points found based on the input"
                        });

                    case "ELI5":
                        result = (await _kernel.RunAsync(context, plugins["Demystify"])).GetValue<string>();
                        return this.Ok(new ResponseBody
                        {
                            Response = result ?? "Unable to produce a result due to insufficient context"
                        });

                    case "TOPICS":
                        result = (await _kernel.RunAsync(context, plugins["Topics"])).GetValue<string>();
                        return this.Ok(new ResponseBody
                        {
                            Response = result ?? "Unable to produce a result due to insufficient context"
                        });

                    default:
                        return this.BadRequest($"The action supplied ({value.Action}) is not supported.");
                }
            }
        }

        private async Task<string> GetSummarizedContent(InputParam value, IPipelineOrchestrator orchestrator, DataPipeline pipeline)
        {
            var generatedFiles = pipeline.Files.SelectMany(x => x.GeneratedFiles);
            var file = generatedFiles.Where(x => x.Value.ArtifactType == ArtifactTypes.SyntheticData).FirstOrDefault();

            if (file.Key != null)
            {
                var content = await orchestrator.ReadFileAsync(pipeline, file.Key);
                return content.ToString();
            }

            return string.Empty;
        }

        [Obsolete]
        private async Task<DataPipeline> Summarize(InputParam value, IPipelineOrchestrator orchestrator)
        {
            //var generatedFiles = pipeline.Files.SelectMany(x => x.GeneratedFiles);
            //var file = generatedFiles.Where(x => x.Value.ArtifactType == ArtifactTypes.ExtractedText).FirstOrDefault();

            //var content = await orchestrator.ReadFileAsync(pipeline, file.Key);
            //int contentLength = GPT3Tokenizer.Encode(content.ToString()).Count;

            //if (contentLength < 2000)
            //{
            //    return content.ToString();
            //}

            //Using the pipeline to summarize large pdfs fails with an error: The response ended prematurely
            var tagsCollection = new TagCollection();
            if (value!.Tags != null)
            {
                foreach (var item in value.Tags)
                {
                    tagsCollection.Add(item.Key, item!.Value);
                }
            }

            TextExtractionHandler textExtractionHandler = new("extract", orchestrator);
            await orchestrator.AddHandlerAsync(textExtractionHandler);

            SummarizationHandler summarizeHandler = new("summarize", orchestrator);
            await orchestrator.AddHandlerAsync(summarizeHandler);

            var pipeline = orchestrator
                .PrepareNewDocumentUpload(index: value.Index, documentId: value.DocumentId, tags: tagsCollection)
                .AddUploadFile(value.Description, value.Filename, value.Filename)
                .Then("extract")
                .Then("summarize")
                .Build();

            await orchestrator.RunPipelineAsync(pipeline);

            return pipeline;
        }

        public class InputParam
        {
            public required string Action { get; set; }
            public required string DocumentId { get; set; }
            public required string Filename { get; set; }
            public required string Index { get; set; }
            public required string Description { get; set; }
            public required Dictionary<string, List<string?>> Tags { get; set; }
        }

        public class ResponseBody
        {
            public required string Response { get; set; }
        }
    }
}