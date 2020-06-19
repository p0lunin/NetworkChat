using NetworkChat.Models;
using NetworkChat.Repositories;
using NetworkChat.ViewModels;
using System.Linq;

namespace NetworkChat.Services
{
    public interface IUserService
    {
        public UserModel CreateUser(string username, string password);
        public UserModel GetUser(string username, string password);
        public User FindUser(string username);
        public UserModel FindUserModel(string username);
        public UserModel[] GetAllUsers();
    }
    public class UserService : IUserService
    {
        private IUsersRepository _repository;
        private IUpdatesService _updatesService;
        public UserService(IUsersRepository repository, IUpdatesService updatesService)
        {
            _repository = repository;
            _updatesService = updatesService;
        }
        public UserModel CreateUser(string username, string password)
        {
            try
            {
                _repository.FindUser(username);
            }
            catch
            {
                var user = new User { Name = username, Password = password, IsOnline = false };
                _repository.AddUser(user);
                _updatesService.NotifyAddUser(user);
                return UserToModel(user);
            }
            throw new UsernameAlreadyExistsException();
        }

        public User FindUser(string username)
        {
            return _repository.FindUser(username);
        }

        public UserModel FindUserModel(string username)
        {
            return UserToModel(FindUser(username));
        }

        public UserModel[] GetAllUsers()
        {
            return _repository.GetAllUsers().Select(UserToModel).ToArray();
        }

        public UserModel GetUser(string username, string password)
        {
            var user = _repository.FindUser(username);
            if (user.Password != password)
            {
                throw new UserNotFoundException();
            }
            else
            {
                return UserToModel(user);
            }
        }

        private UserModel UserToModel(User user)
        {
            return new UserModel(user.Name, user.IsOnline);
        }
    }
}
