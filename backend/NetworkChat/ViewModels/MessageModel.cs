using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetworkChat.ViewModels
{
    public class MessageModel
    {
        public uint ID { get; }
        public UserModel FromUser { get; }
        public DateTime Date { get; }
        public MessageModel(uint id, UserModel user, DateTime date)
        {
            ID = id;
            FromUser = user;
            Date = date;
        }
    }
}
