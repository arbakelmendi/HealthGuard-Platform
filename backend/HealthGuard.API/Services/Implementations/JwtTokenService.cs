using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HealthGuard.API.Models;
using HealthGuard.API.Options;
using HealthGuard.API.Repositories.Interfaces;
using HealthGuard.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace HealthGuard.API.Services.Implementations;

public class JwtTokenService : IJwtTokenService
{
    private readonly JwtOptions _jwtOptions;
    private readonly IRepository<Role> _roleRepository;

    public JwtTokenService(
        IOptions<JwtOptions> jwtOptions,
        IRepository<Role> roleRepository)
    {
        _jwtOptions = jwtOptions.Value;
        _roleRepository = roleRepository;
    }

    public async Task<(string Token, DateTime ExpiresAt)> GenerateTokenAsync(
        User user,
        CancellationToken cancellationToken = default)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role),
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var permissions = await _roleRepository.Query(true)
            .Where(role => role.Name == user.Role)
            .SelectMany(role => role.RolePermissions)
            .Select(rolePermission => rolePermission.Permission.Name)
            .Distinct()
            .ToListAsync(cancellationToken);
        claims.AddRange(permissions.Select(permission => new Claim("permission", permission)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtOptions.ExpiryMinutes);

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
