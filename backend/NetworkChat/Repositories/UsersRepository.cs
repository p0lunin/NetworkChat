using NetworkChat.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace NetworkChat.Repositories
{
    public interface IUsersRepository
    {
        public void AddUser(User user);
        public User FindUser(string username);
        public void SetUserOnline(string username, bool isOnline);
        public List<User> UpdateUserOnlines();
        public IEnumerable<User> GetAllUsers();
    }
    public class UsersRepository : IUsersRepository
    {
        private NetworkChatContext _ctx;
        public UsersRepository(NetworkChatContext ctx)
        {
            _ctx = ctx;
        }

        public void AddUser(User user)
        {
            _ctx.Add(user);
            _ctx.SaveChanges();
        }

        public User FindUser(string username)
        {
            var user = _ctx.Users.Find(username);
            if (user is null)
            {
                throw new UserNotFoundException();
            }
            else
            {
                return user;
            }
        }

        public void SetUserOnline(string username, bool isOnline)
        {
            var user = FindUser(username);
            _ctx.Update(user);
            user.IsOnline = isOnline;
            user.LastOnline = DateTime.Now;
            _ctx.SaveChanges();
        }

        public List<User> UpdateUserOnlines()
        {
            var users = _ctx.Users.Where(user => user.IsOnline).ToList().Where(user => DateTime.Now.Subtract(user.LastOnline).TotalSeconds > 3).ToList();
            users.ForEach(user => user.IsOnline = false);
            _ctx.SaveChanges();
            return users;
        }

        public IEnumerable<User> GetAllUsers()
        {
            return _ctx.Users.Select(user => user);
        }
    }
}
