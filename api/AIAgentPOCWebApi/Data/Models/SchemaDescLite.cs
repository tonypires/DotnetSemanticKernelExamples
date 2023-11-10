namespace AIAgentPOCWebApi.Data.Models
{
    public class SchemaDescLite
    {
        public required string TABLE_SCHEMA { get; set; }

        public required string TABLE_NAME { get; set; }

        public required string COLUMN_NAME { get; set; }

        public required string DATA_TYPE { get; set; }

        public required int ORDINAL_POSITION { get; set; }
    }
}