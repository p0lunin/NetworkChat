using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetworkChat
{
    public class UserNotFoundException : Exception
    {

    }
    public class UserNotHaveEnoughRightsException : Exception
    {

    }
    public class UserAlreadyInChatException : Exception
    {

    }
    public class ChatNotFoundException : Exception
    {

    }
    public class UsernameAlreadyExistsException : Exception
    {

    }
}
