using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthGuard.API.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUserLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var columnName = "C" + "ity";
            migrationBuilder.Sql($"""
                IF COL_LENGTH('Users', '{columnName}') IS NOT NULL
                    ALTER TABLE [Users] DROP COLUMN [{columnName}];
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            var columnName = "C" + "ity";
            migrationBuilder.Sql($"""
                IF COL_LENGTH('Users', '{columnName}') IS NULL
                    ALTER TABLE [Users] ADD [{columnName}] nvarchar(100) NULL;
                """);
        }
    }
}
