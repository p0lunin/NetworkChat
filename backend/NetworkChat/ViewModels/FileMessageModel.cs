using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetworkChat.ViewModels
{
    public class FileMessageModel : MessageModel
    {
        public FileInfoModel File { get; }
        public FileMessageModel(uint id, UserModel user, DateTime date, FileInfoModel file) : base(id, user, date)
        {
            File = file;
        }
    }
}
