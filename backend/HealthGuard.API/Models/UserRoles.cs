namespace HealthGuard.API.Models;

public static class UserRoles
{
    public const string Admin = "Admin";
    public const string User = "User";

    public static readonly HashSet<string> All = new(StringComparer.OrdinalIgnoreCase)
    {
        Admin,
        User
    };

    public static string Normalize(string role)
    {
        if (role.Equals(Admin, StringComparison.OrdinalIgnoreCase))
        {
            return Admin;
        }

        if (role.Equals(User, StringComparison.OrdinalIgnoreCase))
        {
            return User;
        }

        throw new ArgumentException("Role must be Admin or User.", nameof(role));
    }
}
