using System.Text.Json;
using HealthGuard.API.Services.Interfaces;
using StackExchange.Redis;

namespace HealthGuard.API.Services.Implementations;

public class RedisCacheService : IRedisCacheService
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);
    private readonly IConnectionMultiplexer _connectionMultiplexer;
    private readonly ILogger<RedisCacheService> _logger;

    public RedisCacheService(
        IConnectionMultiplexer connectionMultiplexer,
        ILogger<RedisCacheService> logger)
    {
        _connectionMultiplexer = connectionMultiplexer;
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        try
        {
            var value = await Database.StringGetAsync(key);
            return value.IsNullOrEmpty
                ? default
                : JsonSerializer.Deserialize<T>(value.ToString(), SerializerOptions);
        }
        catch (Exception ex) when (IsRedisOrSerializationException(ex))
        {
            _logger.LogWarning(ex, "Redis read failed for key {RedisKey}. Falling back to MSSQL.", key);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        try
        {
            var json = JsonSerializer.Serialize(value, SerializerOptions);
            await Database.StringSetAsync(key, json, expiration);
        }
        catch (Exception ex) when (IsRedisOrSerializationException(ex))
        {
            _logger.LogWarning(ex, "Redis write failed for key {RedisKey}.", key);
        }
    }

    public async Task RemoveAsync(string key)
    {
        try
        {
            await Database.KeyDeleteAsync(key);
        }
        catch (RedisException ex)
        {
            _logger.LogWarning(ex, "Redis delete failed for key {RedisKey}.", key);
        }
    }

    private IDatabase Database => _connectionMultiplexer.GetDatabase();

    private static bool IsRedisOrSerializationException(Exception exception) =>
        exception is RedisException or JsonException or NotSupportedException;
}
