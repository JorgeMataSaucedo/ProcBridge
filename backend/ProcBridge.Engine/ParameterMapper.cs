using Microsoft.Data.SqlClient;
using System.Data;
using System.Reflection;
using System.Text.Json;

namespace ProcBridge.Engine;

/// <summary>
/// Mapea objetos .NET a SqlParameters.
/// Soporta: Dictionary, objetos anónimos, POCOs, JsonElement.
/// </summary>
internal class ParameterMapper
{
    public void MapParameters(SqlCommand cmd, object? payload)
    {
        if (payload == null)
            return;

        // Caso 1: JsonElement (cuando viene desde ASP.NET Core JSON deserialization)
        if (payload is JsonElement jsonElement)
        {
            if (jsonElement.ValueKind == JsonValueKind.Object)
            {
                foreach (var property in jsonElement.EnumerateObject())
                {
                    var paramName = $"@{property.Name}";
                    var value = GetValueFromJsonElement(property.Value);
                    cmd.Parameters.Add(new SqlParameter(paramName, value ?? DBNull.Value));
                }
            }
            return;
        }

        // Caso 2: Dictionary<string, object>
        if (payload is Dictionary<string, object?> dict)
        {
            foreach (var kvp in dict)
            {
                var paramName = kvp.Key.StartsWith("@") ? kvp.Key : $"@{kvp.Key}";
                cmd.Parameters.Add(new SqlParameter(paramName, kvp.Value ?? DBNull.Value));
            }
            return;
        }

        // Caso 3: Objeto anónimo o POCO
        var properties = payload.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);
        foreach (var prop in properties)
        {
            var paramName = $"@{prop.Name}";
            var value = prop.GetValue(payload) ?? DBNull.Value;
            cmd.Parameters.Add(new SqlParameter(paramName, value));
        }
    }

    private object? GetValueFromJsonElement(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString(),
            JsonValueKind.Number => element.TryGetInt32(out var intValue) ? intValue : element.GetDouble(),
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Null => null,
            _ => element.ToString()
        };
    }
}
