namespace AIAgentPOCWebApi.Data.Formatters.Schema
{
    public class SchemaDefinitionLite
    {
        public SchemaDefinitionLite(string name, string platform, string description)
        {
            this.Name = name;
            this.Platform = platform;
            this.Description = description;
        }

        public string Name { get; }

        public string Platform { get; }

        public string? Description { get; }
    }
}