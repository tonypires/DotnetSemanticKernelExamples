using AIAgentPOCWebApi.Data;
using Microsoft.SemanticKernel;
using System.ComponentModel;
using System.Text.Json;

namespace AIAgentPOCWebApi.Plugins
{
    public class GetSchemaPlugin
    {
        private readonly IDataRepository _dataRepository;

        public GetSchemaPlugin(IDataRepository dataRepository)
        {
            _dataRepository = dataRepository;
        }

        [SKFunction, Description("Get the schema for the database")]
        public string GetSchema(string serverName, string databaseName)
        {
            var schema = _dataRepository.GetSchemaDescriptionLite(serverName, databaseName);
            return JsonSerializer.Serialize(schema);
        }

        [SKFunction, Description("Get the schema for the database")]
        public string GetSchemaDefinition(string serverName, string databaseName)
        {
            var schema = _dataRepository.GetSchemaDefinition(serverName, databaseName);
            return JsonSerializer.Serialize(schema);
        }
    }
}