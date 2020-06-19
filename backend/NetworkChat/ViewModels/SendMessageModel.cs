using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetworkChat.ViewModels
{
    public class SendMessageModel
    {
        public string Text { get; }

        public SendMessageModel(string text)
        {
            Text = text;
        }
    }
}
