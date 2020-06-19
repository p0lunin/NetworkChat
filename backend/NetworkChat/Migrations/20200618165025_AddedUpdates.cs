using Microsoft.EntityFrameworkCore.Migrations;

namespace NetworkChat.Migrations
{
    public partial class AddedUpdates : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Updates",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Discriminator = table.Column<string>(nullable: false),
                    NewMessageID = table.Column<uint>(nullable: true),
                    ChatID = table.Column<uint>(nullable: true),
                    NewChatID = table.Column<uint>(nullable: true),
                    NewMemberId = table.Column<uint>(nullable: true),
                    NewMemberUpdate_ChatID = table.Column<uint>(nullable: true),
                    NewOnlineUsername = table.Column<string>(nullable: true),
                    NewUserName = table.Column<string>(nullable: true),
                    RemoveChatID = table.Column<uint>(nullable: true),
                    RemoveMemberUsername = table.Column<string>(nullable: true),
                    RemoveMemberUpdate_ChatID = table.Column<uint>(nullable: true),
                    RemoveOnlineUsername = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Updates", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Updates_Chats_ChatID",
                        column: x => x.ChatID,
                        principalTable: "Chats",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Updates_Message_NewMessageID",
                        column: x => x.NewMessageID,
                        principalTable: "Message",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Updates_Chats_NewChatID",
                        column: x => x.NewChatID,
                        principalTable: "Chats",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Updates_Chats_NewMemberUpdate_ChatID",
                        column: x => x.NewMemberUpdate_ChatID,
                        principalTable: "Chats",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Updates_ChatMembers_NewMemberId",
                        column: x => x.NewMemberId,
                        principalTable: "ChatMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Updates_Users_NewUserName",
                        column: x => x.NewUserName,
                        principalTable: "Users",
                        principalColumn: "Name",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Updates_Chats_RemoveChatID",
                        column: x => x.RemoveChatID,
                        principalTable: "Chats",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Updates_Chats_RemoveMemberUpdate_ChatID",
                        column: x => x.RemoveMemberUpdate_ChatID,
                        principalTable: "Chats",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Updates_ChatID",
                table: "Updates",
                column: "ChatID");

            migrationBuilder.CreateIndex(
                name: "IX_Updates_NewMessageID",
                table: "Updates",
                column: "NewMessageID");

            migrationBuilder.CreateIndex(
                name: "IX_Updates_NewChatID",
                table: "Updates",
                column: "NewChatID");

            migrationBuilder.CreateIndex(
                name: "IX_Updates_NewMemberUpdate_ChatID",
                table: "Updates",
                column: "NewMemberUpdate_ChatID");

            migrationBuilder.CreateIndex(
                name: "IX_Updates_NewMemberId",
                table: "Updates",
                column: "NewMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Updates_NewUserName",
                table: "Updates",
                column: "NewUserName");

            migrationBuilder.CreateIndex(
                name: "IX_Updates_RemoveChatID",
                table: "Updates",
                column: "RemoveChatID");

            migrationBuilder.CreateIndex(
                name: "IX_Updates_RemoveMemberUpdate_ChatID",
                table: "Updates",
                column: "RemoveMemberUpdate_ChatID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Updates");
        }
    }
}
