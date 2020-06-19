using NetworkChat.Repositories;

namespace NetworkChat.Services
{
    public interface IOnlinesService
    {
        public void NotifyUserOnline(string username);
    }
    public class OnlinesService : IOnlinesService
    {
        private readonly IUsersRepository _usersRepository;
        private readonly IUpdatesService _updatesService;

        public OnlinesService(IUsersRepository usersRepository, IUpdatesService updatesService)
        {
            _usersRepository = usersRepository;
            _updatesService = updatesService;
        }

        public void NotifyUserOnline(string username)
        {
            var exitOnline = _usersRepository.UpdateUserOnlines();
            exitOnline.ForEach(user =>
            {
                _updatesService.NotifyRemoveOnlineUser(user.Name);
            });
            var user = _usersRepository.FindUser(username);
            if (user.IsOnline)
            {
                _usersRepository.SetUserOnline(username, true);
            }
            else
            {
                _usersRepository.SetUserOnline(username, true);
                _updatesService.NotifyAddOnlineUser(username);
            }
        }
    }
}
