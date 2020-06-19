using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetworkChat.Models
{
    public enum MemberType
    {
        Common,
        Admin,
    }
    public class ChatMember
    {
        public uint Id { get; set; }
        public User User { get; set; }
        public MemberType MemberType { get; set; }

        public bool IsAdmin()
        {
            return this.MemberType == MemberType.Admin;
        }
    }
}
