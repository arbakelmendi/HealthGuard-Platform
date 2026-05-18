using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthGuard.API.Migrations
{
    /// <inheritdoc />
    public partial class AddHealthRecords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BloodSugar",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "HealthRecords");

            migrationBuilder.RenameColumn(
                name: "RecordDate",
                table: "HealthRecords",
                newName: "CreatedAt");

            migrationBuilder.AlterColumn<int>(
                name: "HeartRate",
                table: "HealthRecords",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "BloodPressure",
                table: "HealthRecords",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30,
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Age",
                table: "HealthRecords",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "Glucose",
                table: "HealthRecords",
                type: "decimal(7,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Height",
                table: "HealthRecords",
                type: "decimal(6,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Weight",
                table: "HealthRecords",
                type: "decimal(6,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Age",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "Glucose",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "Height",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "HealthRecords");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "HealthRecords",
                newName: "RecordDate");

            migrationBuilder.AlterColumn<int>(
                name: "HeartRate",
                table: "HealthRecords",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "BloodPressure",
                table: "HealthRecords",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30);

            migrationBuilder.AddColumn<decimal>(
                name: "BloodSugar",
                table: "HealthRecords",
                type: "decimal(7,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "HealthRecords",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);
        }
    }
}
