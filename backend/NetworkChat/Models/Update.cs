namespace NetworkChat.Models
{
    public class Update
    {
        public int ID { get; set; }
    }

    public class MessageUpdate : Update
    {
        public Message NewMessage { get; set; }
        public Chat Chat { get; set; }
    }
    public class NewMemberUpdate : Update
    {
        public ChatMember NewMember { get; set; }
        public Chat Chat { get; set; }
    }
    public class NewChatUpdate : Update
    {
        public Chat NewChat { get; set; }
    }
    public class NewUserUpdate : Update
    {
        public User NewUser { get; set; }
    }
    public class NewOnlineUserUpdate : Update
    {
        public string NewOnlineUsername { get; set; }
    }
    public class RemoveOnlineUserUpdate : Update
    {
        public string RemoveOnlineUsername { get; set; }
    }
    public class RemoveChatUpdate : Update
    {
        public Chat RemoveChat { get; set; }
    }
    public class RemoveMemberUpdate : Update
    {
        public string RemoveMemberUsername { get; set; }
        public Chat Chat { get; set; }
    }
}
