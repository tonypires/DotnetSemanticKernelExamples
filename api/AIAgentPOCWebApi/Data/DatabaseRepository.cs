using AIAgentPOCWebApi.Constants;
using AIAgentPOCWebApi.Data.Formatters.Schema;
using AIAgentPOCWebApi.Data.Models;
using Dapper;
using System.Data.SqlClient;

namespace AIAgentPOCWebApi.Data
{
    public interface IDataRepository
    {
        SchemaDefinitionLite GetBasicSchemaDefinition(string serverName, string databaseName);

        SchemaDefinition GetSchemaDefinition(string serverName, string databaseName);

        Dictionary<string, string> GetSchemaDescriptionLite(string serverName, string databaseName);

        bool DatabaseExists(string connectionString, string databaseName);

        List<string> GetAvailableDatabases(string serverName);

        bool Connect(string connectionString);
    }

    public class DatabaseRepository : IDataRepository
    {
        public bool Connect(string serverName)
        {
            using SqlConnection connection = new(Settings.GetConnectionString(serverName));
            try
            {
                connection.Open();
                return true;
            }
            catch (SqlException)
            {
                return false;
            }
        }

        public bool DatabaseExists(string serverName, string databaseName)
        {
            using SqlConnection connection = new(Settings.GetConnectionString(serverName));
            connection.Open();

            var result = connection.Query<bool>(@$"
    SELECT CASE WHEN DB_ID('{databaseName}') IS NOT NULL THEN 1 ELSE 0 END as Result
    ").FirstOrDefault();

            return result;
        }

        public SchemaDefinitionLite GetBasicSchemaDefinition(string serverName, string databaseName)
        {
            using SqlConnection connection = new(Settings.GetConnectionString(serverName));
            connection.Open();

            var sql = SQL.GetDatabaseInfo(databaseName);
            var dbRecord = connection
                .Query<dynamic>(sql, new { dbName = databaseName })
                .First();

            return new SchemaDefinitionLite(databaseName, "Microsoft SQL Server", dbRecord.Desc);
        }

        public SchemaDefinition GetSchemaDefinition(string serverName, string databaseName)
        {
            using SqlConnection connection = new(Settings.GetConnectionString(serverName));
            connection.Open();

            var tableMap = new Dictionary<string, List<SchemaColumn>>();

            var columns = connection
                .Query<dynamic>(SQL.GetColumnDescriptions(databaseName))
                .ToList();

            var isViewLookup = columns
                .Where(x => Convert.ToBoolean(x.IsView))
                .Select(x => x.TableName)
                .ToHashSet();

            foreach (var item in columns.GroupBy(x => x.TableName))
            {
                var tableName = item.Key.ToString();
                var tableColumns = item.Select(x => new SchemaColumn(
                    x.ColumnName.ToString(),
                    x.ColumnDesc ?? string.Empty,
                    x.ColumnType.ToString(),
                    Convert.ToBoolean(x.IsPK)))
                    .ToList();

                tableMap.Add(tableName, tableColumns);
            }

            var tables = connection
                .Query<dynamic>(SQL.GetTableDescriptions(databaseName))
                .ToList()
                ?.Select(x => new SchemaTable(
                    x.TableName,
                    x.TableDesc,
                    isViewLookup.Contains(x.TableName),
                    tableMap[x.TableName])
                );

            var schemaDef = new SchemaDefinition(databaseName, "Microsoft SQL Server", tables: tables);

            return schemaDef;
        }

        public Dictionary<string, string> GetSchemaDescriptionLite(string serverName, string databaseName)
        {
            using SqlConnection connection = new(Settings.GetConnectionString(serverName));
            connection.Open();

            var sql = SQL.GetColumnsDescriptionLite(databaseName);
            var result = connection.Query<SchemaDescLite>(sql);

            var lookup = result
                .GroupBy(x => x.TABLE_NAME)
                .ToDictionary(
                    x => x.Key,
                    x => string.Join(',', x.Select(y => FormatColumnName(y)))
                 );

            return lookup;
        }

        public List<string> GetAvailableDatabases(string serverName)
        {
            using SqlConnection connection = new(Settings.GetConnectionString(serverName));
            connection.Open();

            var sql = SQL.GetDatabases();
            var result = connection.Query<string>(sql);

            return result.ToList();
        }

        private string FormatColumnName(SchemaDescLite item) => $"{item.COLUMN_NAME} (Type: {item.DATA_TYPE})";
    }
}