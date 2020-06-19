using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace NetworkChat.Models
{
    public abstract class Message
    {
        [Key]
        public uint ID { get; set; }
        public User FromUser { get; set; }
        public DateTime Date { get; set; }
    }
    public class TextMessage : Message
    {
        public string Text { get; set; }
    }
    public class ImageMessage : Message
    {
        public FileInfo Image { get; set; }
    }
    public class FileMessage : Message
    {
        public FileInfo File { get; set; }
    }
}
