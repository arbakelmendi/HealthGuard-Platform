using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthGuard.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPredictionResults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActivityLevel",
                table: "HealthRecords",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "BloodSugar",
                table: "HealthRecords",
                type: "decimal(7,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Bmi",
                table: "HealthRecords",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Cholesterol",
                table: "HealthRecords",
                type: "decimal(7,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "DiastolicBp",
                table: "HealthRecords",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "HealthRecords",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "HeightCm",
                table: "HealthRecords",
                type: "decimal(6,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SleepHours",
                table: "HealthRecords",
                type: "decimal(4,1)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "SmokingStatus",
                table: "HealthRecords",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "StressLevel",
                table: "HealthRecords",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Symptoms",
                table: "HealthRecords",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "SystolicBp",
                table: "HealthRecords",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "WeightKg",
                table: "HealthRecords",
                type: "decimal(6,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "PredictionResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    HealthRecordId = table.Column<int>(type: "int", nullable: true),
                    RiskLevel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    RiskScore = table.Column<int>(type: "int", nullable: false),
                    Explanation = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ContributingFactors = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModelName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PredictionResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PredictionResults_HealthRecords_HealthRecordId",
                        column: x => x.HealthRecordId,
                        principalTable: "HealthRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PredictionResults_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_PredictionResults_HealthRecordId",
                table: "PredictionResults",
                column: "HealthRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_PredictionResults_UserId",
                table: "PredictionResults",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PredictionResults");

            migrationBuilder.DropColumn(
                name: "ActivityLevel",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "BloodSugar",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "Bmi",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "Cholesterol",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "DiastolicBp",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "HeightCm",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "SleepHours",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "SmokingStatus",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "StressLevel",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "Symptoms",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "SystolicBp",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "WeightKg",
                table: "HealthRecords");
        }
    }
}
