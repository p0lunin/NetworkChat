using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetworkChat.ViewModels
{
    public class UserRegistrationModel
    {
        public string Name { get; }
        public string Password { get; }

        public UserRegistrationModel(string name, string password)
        {
            Name = name;
            Password = password;
        }
    }
    public class UserModel
    {
        public string Name { get; }
        public bool IsOnline { get; }

        public UserModel(string name, bool isOnline)
        {
            Name = name;
            IsOnline = isOnline;
        }
    }
}
