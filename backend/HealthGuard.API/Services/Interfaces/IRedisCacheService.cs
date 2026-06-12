namespace HealthGuard.API.Services.Interfaces;

public interface IRedisCacheService
{
    Task<T?> GetAsync<T>(string key);

    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null);

    Task RemoveAsync(string key);

    Task<int?> GetIntAsync(string key);

    Task SetIntAsync(string key, int value, TimeSpan? expiration = null);

    Task PushToListAsync<T>(string key, T value, long maxLength, TimeSpan? expiration = null);
}
