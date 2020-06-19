using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace NetworkChat.Models
{
    public class FileInfo
    {
        public string Name { get; set; }
        [Key]
        public string URL { get; set; }
        public string Path { get; set; }
    }
}
