using Microsoft.EntityFrameworkCore;

namespace NetworkChat.Models
{
    public class NetworkChatContext : DbContext
    {
        public DbSet<Chat> Chats { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<FileInfo> FileInfos { get; set; }
        public DbSet<TextMessage> TextMessages { get; set; }
        public DbSet<FileMessage> FileMessages { get; set; }
        public DbSet<ImageMessage> ImageMessages { get; set; }
        public DbSet<ChatMember> ChatMembers { get; set; }
        public DbSet<Update> Updates { get; set; }
        public DbSet<MessageUpdate> MessageUpdates { get; set; }
        public DbSet<NewMemberUpdate> NewMemberUpdates { get; set; }
        public DbSet<NewChatUpdate> NewChatUpdates { get; set; }
        public DbSet<NewUserUpdate> NewUserUpdates { get; set; }
        public DbSet<NewOnlineUserUpdate> NewOnlineUserUpdates { get; set; }
        public DbSet<RemoveOnlineUserUpdate> RemoveOnlineUserUpdates { get; set; }
        public DbSet<RemoveChatUpdate> RemoveChatUpdates { get; set; }
        public DbSet<RemoveMemberUpdate> RemoveMemberUpdates { get; set; }
        protected override void OnConfiguring(DbContextOptionsBuilder options)
            => options.UseSqlite("Data Source=database.db");
    }
}
