using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetworkChat.ViewModels
{
    public class FileInfoModel
    {
        public string Name { get; }
        public string URL { get; }
        public FileInfoModel(string name, string url)
        {
            Name = name;
            URL = url;
        }
    }
}
