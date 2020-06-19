using System;
using System.Collections.Generic;
using System.Linq;
using NetworkChat.Models;
using NetworkChat.Repositories;

namespace NetworkChat.Services
{
    public interface IUpdatesService
    {
        public void NotifyAddMessage(Message message, Chat chat)
        {
            AddUpdate(new MessageUpdate { NewMessage = message, Chat = chat });
        }
        public void NotifyAddMember(ChatMember member, Chat chat)
        {
            AddUpdate(new NewMemberUpdate { NewMember = member, Chat = chat });
        }
        public void NotifyAddChat(Chat chat)
        {
            AddUpdate(new NewChatUpdate { NewChat = chat });
        }
        public void NotifyAddUser(User user)
        {
            AddUpdate(new NewUserUpdate { NewUser = user });
        }
        public void NotifyAddOnlineUser(string username)
        {
            AddUpdate(new NewOnlineUserUpdate { NewOnlineUsername = username});
        }
        public void NotifyRemoveOnlineUser(string username)
        {
            AddUpdate(new RemoveOnlineUserUpdate { RemoveOnlineUsername = username});
        }
        public void NotifyRemoveChat(Chat chat)
        {
            AddUpdate(new RemoveChatUpdate { RemoveChat = chat });
        }
        public void NotifyRemoveMember(string member, Chat chat)
        {
            AddUpdate(new RemoveMemberUpdate() { RemoveMemberUsername = member, Chat = chat});
        }
        public void AddUpdate(Update update);
        public List<Update> GetUserUpdates(string username, uint from);
        public int GetLastUpdateId();
    }

    public class UpdatesService : IUpdatesService
    {
        private IUpdatesRepository _updatesRepository;

        public UpdatesService(IUpdatesRepository updatesRepository)
        {
            _updatesRepository = updatesRepository;
        }

        public void AddUpdate(Update update)
        {
            this._updatesRepository.AddUpdate(update);
        }

        public List<Update> GetUserUpdates(string username, uint from)
        {
            var updates = _updatesRepository.GetUpdates().Where(upd => upd.ID >= from).ToList();
            _updatesRepository.LoadData();
            return updates.Where(upd =>
            {
                switch (upd)
                {
                    case MessageUpdate m:
                        return m.Chat.IsUserInChat(username);
                    case NewMemberUpdate m:
                        return m.Chat.IsUserInChat(username);
                    case NewChatUpdate c:
                        return false;
                    case NewUserUpdate u:
                        return true;
                    case NewOnlineUserUpdate u:
                        return true;
                    case RemoveOnlineUserUpdate u:
                        return true;
                    case RemoveChatUpdate u:
                        return u.RemoveChat.IsUserInChat(username);
                    case RemoveMemberUpdate m:
                        return m.Chat.IsUserInChat(username);
                    default:
                        throw new Exception("Unexpected update type!");
                }
            }).ToList();
        }

        public int GetLastUpdateId()
        {
            return _updatesRepository.GetLastUpdateId();
        }
    }
}
