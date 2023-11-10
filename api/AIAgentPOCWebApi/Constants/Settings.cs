namespace AIAgentPOCWebApi.Constants
{
    public class Settings
    {
        public static string GetConnectionString(string serverName)
        {
            return string.Format("Server={0};Database=master;Trusted_Connection=True;", serverName);
        }
    }
}