using NetworkChat.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace NetworkChat.Repositories
{
    public interface IChatRepository
    {
        public Chat GetChat(uint chatId);
        public void AddChat(Chat chat);
        public void AddMemberToChat(ChatMember member, Chat chat);
        public void DeleteChat(Chat chat);
        public void RemoveChatMemberFromChat(Chat chat, string username);
        public void AddMessage(Chat chat, Message message);
        public IEnumerable<Chat> GetUserChats(string username);
    }
    public class ChatsRepository : IChatRepository
    {
        private NetworkChatContext ctx;
        public ChatsRepository(NetworkChatContext ctx) => this.ctx = ctx;
        public Chat GetChat(uint chatId)
        {
            var chat = ctx
                .Chats
                .Select(chat => chat)
                .FirstOrDefault(chat => chat.ID == chatId);

            ctx.ChatMembers.Load();
            ctx.FileMessages.Load();
            ctx.ImageMessages.Load();
            ctx.Users.Load();
            ctx.FileInfos.Load();

            if (chat == null)
            {
                throw new ChatNotFoundException();
            }
            return chat;
        }
        public void AddChat(Chat chat)
        {
            ctx.Add(chat);
            ctx.SaveChanges();
        }
        public void AddMemberToChat(ChatMember member, Chat chat)
        {
            chat.Members.Add(member);
            ctx.SaveChanges();
        }
        public void DeleteChat(Chat chat)
        {
            ctx.Chats.Remove(chat);
            ctx.SaveChanges();
        }
        public void RemoveChatMemberFromChat(Chat chat, string username)
        {
            var member = chat.Members.First(member => member.User.Name == username);
            if (member == null) throw new UserNotFoundException();
            chat.Members.Remove(member);
            ctx.SaveChanges();
        }

        public IEnumerable<Chat> GetUserChats(string username)
        {
            var chats = ctx.Chats
                .Select(chat => chat)
                .Where(chat => chat.Members.Any(member => member.User.Name == username));
            ctx.ChatMembers.Load();
            ctx.FileMessages.Load();
            ctx.ImageMessages.Load();
            ctx.Users.Load();
            ctx.FileInfos.Load();
            return chats;
        }

        public void AddMessage(Chat chat, Message message)
        {
            chat.Messages.Add(message);
            ctx.SaveChanges();
        }
    }
}
