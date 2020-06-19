using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetworkChat.ViewModels
{
    public class ImageMessageModel : MessageModel
    {
        public FileInfoModel Image { get; }
        public ImageMessageModel(uint id, UserModel user, DateTime date, FileInfoModel file) : base(id, user, date)
        {
            Image = file;
        }
    }
}
