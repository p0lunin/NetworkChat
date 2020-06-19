using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace NetworkChat.Models
{
    public class Chat
    {
        public string Title { get; set; }
        [Key]
        public uint ID { get; set; }
        public ICollection<ChatMember> Members { get; set; }
        public ICollection<Message> Messages { get; set; }

        public Chat()
        {
            Members = new List<ChatMember>();
            Messages = new List<Message>();
        }

        public bool IsUserInChat(string username)
        {
            return this.Members.Any(m => m.User.Name == username);
        }
    }
}
