using System.Security.Claims;
using HealthGuard.API.DTOs.Auth;
using HealthGuard.API.DTOs.Common;
using HealthGuard.API.Middleware;
using HealthGuard.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthGuard.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _authService.RegisterAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Register), response);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        return Ok(await _authService.LoginAsync(request, cancellationToken));
    }

    [HttpPut("change-password")]
    [Authorize]
    public async Task<ActionResult<ApiMessageResponse>> ChangePassword([FromBody] ChangePasswordDto request, CancellationToken cancellationToken)
    {
        await _authService.ChangePasswordAsync(GetCurrentUserId(), request, cancellationToken);
        return Ok(new ApiMessageResponse("Password changed successfully."));
    }

    private int GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userId, out var parsed))
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "Invalid authentication token.");
        }

        return parsed;
    }
}
