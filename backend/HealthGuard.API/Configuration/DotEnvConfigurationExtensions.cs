namespace HealthGuard.API.Configuration;

public static class DotEnvConfigurationExtensions
{
    public static IConfigurationBuilder AddDotEnvFile(
        this IConfigurationBuilder builder,
        string path,
        bool optional = true)
    {
        if (!File.Exists(path))
        {
            if (optional)
            {
                return builder;
            }

            throw new FileNotFoundException("The .env configuration file was not found.", path);
        }

        var values = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        foreach (var rawLine in File.ReadLines(path))
        {
            var line = rawLine.Trim();
            if (line.Length == 0 || line.StartsWith('#'))
            {
                continue;
            }

            if (line.StartsWith("export ", StringComparison.OrdinalIgnoreCase))
            {
                line = line[7..].Trim();
            }

            var separator = line.IndexOf('=');
            if (separator <= 0)
            {
                continue;
            }

            var key = line[..separator].Trim().Replace("__", ":", StringComparison.Ordinal);
            var value = line[(separator + 1)..].Trim();
            if (value.Length >= 2
                && ((value[0] == '"' && value[^1] == '"')
                    || (value[0] == '\'' && value[^1] == '\'')))
            {
                value = value[1..^1];
            }

            values[key] = value;
        }

        return builder.AddInMemoryCollection(values);
    }
}
