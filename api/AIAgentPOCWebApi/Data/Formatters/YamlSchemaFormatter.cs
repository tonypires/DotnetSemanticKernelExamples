using YamlDotNet.Serialization.NamingConventions;
using YamlDotNet.Serialization;

namespace AIAgentPOCWebApi.Data.Formatters
{
    public class YamlSchemaFormatter
    {
        public static string Format(object target)
        {
            var yamlSerializer = new SerializerBuilder()
                .WithNamingConvention(CamelCaseNamingConvention.Instance)
                .Build();

            return yamlSerializer.Serialize(target);
        }
    }
}