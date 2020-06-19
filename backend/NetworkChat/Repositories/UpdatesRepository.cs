using NetworkChat.Models;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace NetworkChat.Repositories
{
    public interface IUpdatesRepository
    {
        public IQueryable<Update> GetUpdates();
        public void AddUpdate(Update update);
        public int GetLastUpdateId();
        public void LoadData();
    }
    public class UpdatesRepository : IUpdatesRepository
    {
        private NetworkChatContext ctx;
        public UpdatesRepository(NetworkChatContext ctx) => this.ctx = ctx;
        public IQueryable<Update> GetUpdates()
        {
            return ctx.Updates.Select(upd => upd);
        }

        public void AddUpdate(Update update)
        {
            ctx.Add(update);
            ctx.SaveChanges();
        }

        public int GetLastUpdateId()
        {
            return ctx.Updates.OrderBy(upd => upd.ID).Select(upd => upd.ID).Last();
        }

        public void LoadData()
        {
            ctx.MessageUpdates.Load();
            ctx.NewMemberUpdates.Load();
            ctx.NewChatUpdates.Load();
            ctx.NewUserUpdates.Load();
            ctx.NewOnlineUserUpdates.Load();
            ctx.RemoveOnlineUserUpdates.Load();
            ctx.RemoveChatUpdates.Load();
            ctx.RemoveMemberUpdates.Load();
            ctx.Chats.Load();
            ctx.ChatMembers.Load();
            ctx.FileMessages.Load();
            ctx.ImageMessages.Load();
            ctx.TextMessages.Load();
            ctx.Users.Load();
            ctx.FileInfos.Load();
            ctx.MessageUpdates.Load();
        }
    }
}
