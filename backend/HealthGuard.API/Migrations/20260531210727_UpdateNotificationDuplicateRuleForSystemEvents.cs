using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthGuard.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateNotificationDuplicateRuleForSystemEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId_PredictionResultId_Type",
                table: "Notifications");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_PredictionResultId_Title",
                table: "Notifications",
                columns: new[] { "UserId", "PredictionResultId", "Title" },
                unique: true,
                filter: "[PredictionResultId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId_PredictionResultId_Title",
                table: "Notifications");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_PredictionResultId_Type",
                table: "Notifications",
                columns: new[] { "UserId", "PredictionResultId", "Type" },
                unique: true,
                filter: "[PredictionResultId] IS NOT NULL");
        }
    }
}
