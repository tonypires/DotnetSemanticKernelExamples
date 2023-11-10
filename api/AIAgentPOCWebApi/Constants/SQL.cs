namespace AIAgentPOCWebApi.Constants
{
    public class SQL
    {
        public static string GetDatabaseInfo(string databaseName)
        {
            return string.Format(@"
USE {0};

SELECT
  D.name,
  ep.value AS [Desc]
FROM sys.extended_properties EP
JOIN sys.databases D ON ep.major_id = D.database_id
WHERE ep.name = 'MS_DESCRIPTION'
AND ep.minor_id = 0
AND D.[name] = @dbName
", databaseName);
        }

        public static string GetTableDescriptions(string databaseName)
        {
            return string.Format(@"
USE {0};

SELECT
  S.name AS SchemaName,
  O.name AS TableName,
  ep.value AS TableDesc
FROM sys.extended_properties EP
JOIN sys.tables O ON ep.major_id = O.object_id
JOIN sys.schemas S on O.schema_id = S.schema_id
WHERE ep.name = 'MS_DESCRIPTION'
AND ep.minor_id = 0
", databaseName);
        }

        public static string GetColumnDescriptions(string databaseName)
        {
            return string.Format(@"
USE {0};
SELECT
    sch.name AS SchemaName,
    tab.name AS TableName,
    col.name AS ColumnName,
	ep.value AS ColumnDesc,
    base.name AS ColumnType,
    CAST(IIF(ic.column_id IS NULL, 0, 1) AS bit) IsPK,
    tab.IsView
FROM
(
    select object_id, schema_id, name, CAST(0 as bit) IsView from sys.tables
    UNION ALL
    select object_id, schema_id, name, CAST(1 as bit) IsView from sys.views
) tab
INNER JOIN sys.objects obj ON obj.object_id = tab.object_id
INNER JOIN sys.schemas sch ON tab.schema_id = sch.schema_id
INNER JOIN sys.columns col ON col.object_id = tab.object_id
INNER JOIN sys.types t ON col.user_type_id = t.user_type_id
INNER JOIN sys.types base ON t.system_type_id = base.user_type_id
LEFT OUTER JOIN sys.indexes pk ON tab.object_id = pk.object_id AND pk.is_primary_key = 1
LEFT OUTER JOIN sys.index_columns ic ON ic.object_id = pk.object_id AND ic.index_id = pk.index_id AND ic.column_id = col.column_id
LEFT OUTER JOIN sys.extended_properties ep ON ep.major_id = col.object_id AND ep.minor_id = col.column_id and ep.name = 'MS_DESCRIPTION'
WHERE sch.name != 'sys'
ORDER BY SchemaName, TableName, IsPK DESC, ColumnName
", databaseName);
        }

        public static string GetReferenceDescriptions(string databaseName)
        {
            return string.Format(@"
SELECT
    obj.name AS KeyName,
    sch.name AS SchemaName,
    parentTab.name AS TableName,
    parentCol.name AS ColumnName,
    refTable.name AS ReferencedTableName,
    refCol.name AS ReferencedColumnName
  FROM sys.foreign_key_columns fkc
  INNER JOIN sys.objects obj ON obj.object_id = fkc.constraint_object_id
  INNER JOIN sys.tables parentTab ON parentTab.object_id = fkc.parent_object_id
  INNER JOIN sys.schemas sch ON parentTab.schema_id = sch.schema_id
  INNER JOIN sys.columns parentCol ON parentCol.column_id = parent_column_id AND parentCol.object_id = parentTab.object_id
  INNER JOIN sys.tables refTable ON refTable.object_id = fkc.referenced_object_id
  INNER JOIN sys.columns refCol ON refCol.column_id = referenced_column_id AND refCol.object_id = refTable.object_id
", databaseName);
        }

        public static string GetColumnsDescriptionLite(string databaseName)
        {
            return string.Format(@"
USE {0};

 SELECT TABLE_SCHEMA ,
       TABLE_NAME ,
       COLUMN_NAME ,
       ORDINAL_POSITION ,
       DATA_TYPE
FROM   INFORMATION_SCHEMA.COLUMNS;
", databaseName);
        }

        public static string GetDatabases()
        {
            return @"SELECT name FROM master.dbo.sysdatabases";
        }
    }
}