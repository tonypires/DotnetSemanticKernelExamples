using System.Text.Json.Serialization;

namespace AIAgentPOCWebApi.Data.Formatters.Schema
{
    public class SchemaColumn
    {
        public SchemaColumn(
           string name,
           string? description,
           string type,
           bool isPrimary)
        {
            this.Name = name;
            this.Description = description;
            this.Type = type;
            this.IsPrimary = isPrimary;
        }

        public string Name { get; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public string? Description { get; }

        public string Type { get; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public bool IsPrimary { get; }
    }
}