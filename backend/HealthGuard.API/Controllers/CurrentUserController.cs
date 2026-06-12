using System.Security.Claims;
using HealthGuard.API.DTOs.Auth;
using HealthGuard.API.DTOs.Common;
using HealthGuard.API.DTOs.Profile;
using HealthGuard.API.DTOs.Users;
using HealthGuard.API.Middleware;
using HealthGuard.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Controllers;

[ApiController]
[Route("api/users/me")]
[Authorize]
public class CurrentUserController : ControllerBase
{
    private readonly IApplicationDataService _dataService;
    private readonly IUserService _userService;
    private readonly IAuthService _authService;

    public CurrentUserController(IApplicationDataService dataService, IUserService userService, IAuthService authService)
    {
        _dataService = dataService;
        _userService = userService;
        _authService = authService;
    }

    [HttpGet]
    public async Task<ActionResult<UserResponseDto>> GetMe(CancellationToken cancellationToken)
    {
        return Ok(await _userService.GetProfileAsync(GetCurrentUserId(), cancellationToken));
    }

    [HttpPut]
    public async Task<ActionResult<UserResponseDto>> UpdateMe([FromBody] UpdateProfileDto request, CancellationToken cancellationToken)
    {
        return Ok(await _userService.UpdateProfileAsync(GetCurrentUserId(), request, cancellationToken));
    }

    [HttpPut("password")]
    public async Task<ActionResult<ApiMessageResponse>> ChangeMyPassword([FromBody] ChangePasswordDto request, CancellationToken cancellationToken)
    {
        await _authService.ChangePasswordAsync(GetCurrentUserId(), request, cancellationToken);
        return Ok(new ApiMessageResponse("Password changed successfully."));
    }

    [HttpDelete]
    public async Task<ActionResult<ApiMessageResponse>> DeleteMe(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var user = await _dataService.Query<HealthGuard.API.Models.User>().FirstOrDefaultAsync(item => item.Id == userId, cancellationToken);

        if (user is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "User not found.");
        }

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        await _dataService.SaveChangesAsync(cancellationToken);

        return Ok(new ApiMessageResponse("Account deactivated successfully."));
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
