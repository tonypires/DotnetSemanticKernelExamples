namespace AIAgentPOCWebApi.Data.Formatters.Schema
{
    public class SchemaDefinition
    {
        public static string MemoryCollectionName = "data-schemas";

        public SchemaDefinition(
           string name,
           string platform,
           string? description = null,
           IEnumerable<SchemaTable>? tables = null)
        {
            this.Name = name;
            this.Platform = platform;
            this.Description = description;
            this.Tables = tables ?? Array.Empty<SchemaTable>();
        }

        public string Name { get; }

        public string Platform { get; }

        public string? Description { get; }

        public IEnumerable<SchemaTable> Tables { get; }
    }
}