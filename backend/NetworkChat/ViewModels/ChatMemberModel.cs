using NetworkChat.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetworkChat.ViewModels
{
    public class ChatMemberModel
    {
        public User User { get; }
        public MemberType MemberType { get; }

        public ChatMemberModel(User user, MemberType memberType)
        {
            User = user;
            MemberType = memberType;
        }
    }
}
