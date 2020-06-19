using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetworkChat.ViewModels
{
    public class TextMessageModel : MessageModel
    {
        public string Text { get; }
        public TextMessageModel(uint id, UserModel user, DateTime date, string text) : base(id, user, date)
        {
            Text = text;
        }
    }
}
