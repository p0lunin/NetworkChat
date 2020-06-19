using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetworkChat.ViewModels
{
    public class AuthorizationResultModel
    {
        public string Token { get; }
        public UserModel User { get; set; }
        public AuthorizationResultModel(string token, UserModel user)
        {
            Token = token;
            User = user;
        }
    }
}
