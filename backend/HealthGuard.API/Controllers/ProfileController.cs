using System.Security.Claims;
using HealthGuard.API.DTOs.Profile;
using HealthGuard.API.DTOs.Users;
using HealthGuard.API.Middleware;
using HealthGuard.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthGuard.API.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IUserService _userService;

    public ProfileController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<UserResponseDto>> GetProfile(CancellationToken cancellationToken)
    {
        return Ok(await _userService.GetProfileAsync(GetCurrentUserId(), cancellationToken));
    }

    [HttpPut]
    public async Task<ActionResult<UserResponseDto>> UpdateProfile([FromBody] UpdateProfileDto request, CancellationToken cancellationToken)
    {
        return Ok(await _userService.UpdateProfileAsync(GetCurrentUserId(), request, cancellationToken));
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
