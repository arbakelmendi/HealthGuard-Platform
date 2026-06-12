using System.Security.Claims;
using HealthGuard.API.DTOs.Dashboard;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using HealthGuard.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthGuard.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("me")]
    [Authorize(Roles = UserRoles.User)]
    public async Task<ActionResult<DashboardDto>> GetMine(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var userId))
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "Invalid authentication token.");
        }

        return Ok(await _dashboardService.GetMineAsync(userId, cancellationToken));
    }

    [HttpGet("admin")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult<AdminDashboardDto>> GetAdmin(CancellationToken cancellationToken)
    {
        return Ok(await _dashboardService.GetAdminAsync(cancellationToken));
    }
}
