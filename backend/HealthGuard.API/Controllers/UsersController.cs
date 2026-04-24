using System.Security.Claims;
using HealthGuard.API.DTOs.Common;
using HealthGuard.API.DTOs.Users;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using HealthGuard.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthGuard.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = UserRoles.Admin)]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserResponseDto>>> GetUsers([FromQuery] string? search, CancellationToken cancellationToken)
    {
        return Ok(await _userService.GetAllAsync(search, cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserResponseDto>> GetUser(int id, CancellationToken cancellationToken)
    {
        return Ok(await _userService.GetByIdAsync(id, cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<UserResponseDto>> CreateUser([FromBody] CreateUserDto request, CancellationToken cancellationToken)
    {
        var user = await _userService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<UserResponseDto>> UpdateUser(int id, [FromBody] UpdateUserDto request, CancellationToken cancellationToken)
    {
        return Ok(await _userService.UpdateAsync(id, request, cancellationToken));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiMessageResponse>> DeleteUser(int id, CancellationToken cancellationToken)
    {
        await _userService.DeleteAsync(id, GetCurrentUserId(), cancellationToken);
        return Ok(new ApiMessageResponse("User deleted successfully."));
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
