using System;
using System.ComponentModel.DataAnnotations;

namespace NetworkChat.Models
{
    public class User
    {
        [Key]
        public string Name { get; set; }
        public string Password { get; set; }
        public bool IsOnline { get; set; }
        public DateTime LastOnline { get; set; }
    }
}
