using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel.Orchestration;
using Microsoft.SemanticKernel;

namespace AIAgentPOCWebApi.Controllers
{
    [Route("api/sentiment")]
    [ApiController]
    public class GetSentimentController : ControllerBase
    {
        private readonly IKernel _kernel;

        public GetSentimentController(IKernel kernel)
        {
            _kernel = kernel;
        }

        // POST api/<GetSentimentController>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] string value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return this.BadRequest("Input is invalid.");
            }

            var variables = new ContextVariables
            {
                ["options"] = "POSITIVE, NEGATIVE, NEUTRAL",
                ["input"] = value
            };
            var currentDirectory = AppDomain.CurrentDomain.BaseDirectory;
            var pluginsDirectory = Path.Combine(currentDirectory, "Plugins");
            var getSentimentPlugin = _kernel.ImportSemanticFunctionsFromDirectory(pluginsDirectory, "SentimentPlugin");

            var response = (await _kernel.RunAsync(variables, getSentimentPlugin["GetSentiment"])).GetValue<string>();

            if (string.IsNullOrEmpty(response))
            {
                return this.Ok(new SentimentResponse
                {
                    Reasoning = "Based on the information provided, a sentiment analysis couldn't be ascertained.  Please provide more information."
                });
            }

            var sentiment = response!.Substring(0, response.IndexOf("."));
            var theRest = response!.Substring(response.IndexOf(".") + 1)?.Trim();

            return this.Ok(new SentimentResponse
            {
                Sentiment = sentiment,
                Reasoning = theRest!
            });
        }
    }

    public class SentimentResponse
    {
        public string? Sentiment { get; set; }

        public required string Reasoning { get; set; }
    }
}