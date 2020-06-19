using NetworkChat.Models;
using System.Collections.Generic;
using System.Linq;

namespace NetworkChat.ViewModels
{
    public class GetChatModel
    {
        public string Title { get; }

        public GetChatModel(string title)
        {
            Title = title;
        }
    }
    public class ChatModel
    {
        public string Title { get; }
        public uint ID { get; }
        public List<Message> Messages { get; }
        public List<ChatMemberModel> Members { get; }
        public ChatModel(string title, uint id, List<Message> messages, List<ChatMemberModel> members)
        {
            ID = id;
            Title = title;
            Messages = messages;
            Members = members;
        }
    }
}
