using Microsoft.AspNetCore.Http;
using NetworkChat.Models;
using NetworkChat.Repositories;
using NetworkChat.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;

namespace NetworkChat.Services
{
    public interface IChatService
    {
        public ChatModel CreateChat(User creator, string title);
        public ChatModel[] GetUserChats(string username);
        public void DeleteChat(string deleter, uint chatId);
        public ChatMemberModel AddUserToChat(string adder, uint chatId, User userToAdd);
        public void RemoveUserFromChat(string remover, string user, uint chatId);
        public TextMessageModel SendTextMessage(User sender, uint chatId, string text);
        public FileMessageModel SendFileMessage(User sender, uint chatId, IFormFile uploadedFile);
        public ImageMessageModel SendImageMessage(User sender, uint chatId, IFormFile uploadedFile);
    }
    public class ChatService : IChatService
    {
        private IChatRepository _repository;
        private IFileService _fileService;
        private IUpdatesService _updatesService;
        public ChatService(IChatRepository repository, IFileService fileService, IUpdatesService updatesService)
        {
            _repository = repository;
            _fileService = fileService;
            _updatesService = updatesService;
        }

        public ChatMemberModel AddUserToChat(string adder, uint chatId, User userToAdd)
        {
            var chat = _repository.GetChat(chatId);
            ValidateUserIsAdmin(chat, adder);
            if (chat.Members.Any(member => member.User.Name == userToAdd.Name))
            {
                throw new UserAlreadyInChatException();
            }
            var member = new ChatMember { User = userToAdd, MemberType = MemberType.Common };
            _repository.AddMemberToChat(member, chat);
            _updatesService.NotifyAddMember(member, chat);
            return ChatMemberToModel(member);
        }

        public ChatModel CreateChat(User creator, string title)
        {
            var chatCreator = new ChatMember {User = creator, MemberType = MemberType.Admin};
            var members = new List<ChatMember>
            {
                chatCreator
            };
            var chat = new Chat { Title = title, Members = members };
            _repository.AddChat(chat);
            return ChatToModel(chat);
        }

        public void DeleteChat(string deleter, uint chatId)
        {
            var chat = _repository.GetChat(chatId);
            ValidateUserIsAdmin(chat, deleter);
            _repository.DeleteChat(chat);
            _updatesService.NotifyRemoveChat(chat);
        }

        public ChatModel[] GetUserChats(string username)
        {
            return _repository.GetUserChats(username).Select(ChatToModel).ToArray();
        }

        public void RemoveUserFromChat(string remover, string user, uint chatId)
        {
            var chat = _repository.GetChat(chatId);
            ValidateUserIsAdmin(chat, remover);
            _repository.RemoveChatMemberFromChat(chat, user);
            _updatesService.NotifyRemoveMember(user, chat);
        }

        public TextMessageModel SendTextMessage(User sender, uint chatId, string text)
        {
            var chat = _repository.GetChat(chatId);
            ValidateUserInChat(chat, sender.Name);
            var message = new TextMessage { Date = DateTime.UtcNow, FromUser = sender, Text = text };
            _repository.AddMessage(chat, message);
            _updatesService.NotifyAddMessage(message, chat);
            return TextMessageToModel(message);
        }

        public FileMessageModel SendFileMessage(User sender, uint chatId, IFormFile uploadedFile)
        {
            var chat = _repository.GetChat(chatId);
            ValidateUserInChat(chat, sender.Name);
            var fileInfo = _fileService.AddFile(uploadedFile);
            var message = new FileMessage { Date = DateTime.UtcNow, FromUser = sender, File = fileInfo };
            _repository.AddMessage(chat, message);
            _updatesService.NotifyAddMessage(message, chat);
            return FileMessageToModel(message);
        }

        public ImageMessageModel SendImageMessage(User sender, uint chatId, IFormFile uploadedFile)
        {
            var chat = _repository.GetChat(chatId);
            ValidateUserInChat(chat, sender.Name);
            var fileInfo = _fileService.AddImage(uploadedFile);
            var message = new ImageMessage { Date = DateTime.UtcNow, FromUser = sender, Image = fileInfo };
            _repository.AddMessage(chat, message);
            _updatesService.NotifyAddMessage(message, chat);
            return ImageMessageToModel(message);
        }

        private void ValidateUserIsAdmin(Chat chat, string username)
        {
            if (!chat.Members.Any(member => member.User.Name == username && member.IsAdmin()))
            {
                throw new UserNotHaveEnoughRightsException();
            }
        }
        private void ValidateUserInChat(Chat chat, string username)
        {
            if (!chat.Members.Any(member => member.User.Name == username))
            {
                throw new ChatNotFoundException();
            }
        }

        private ChatModel ChatToModel(Chat chat)
        {
            var members = chat.Members.Select(ChatMemberToModel).ToList();
            return new ChatModel(chat.Title, chat.ID, chat.Messages.ToList(), members);
        }
        private ChatMemberModel ChatMemberToModel(ChatMember member)
        {
            return new ChatMemberModel(member.User, member.MemberType);
        }

        private TextMessageModel TextMessageToModel(TextMessage message)
        {
            return new TextMessageModel(message.ID, UserToModel(message.FromUser), message.Date, message.Text);
        }

        private FileMessageModel FileMessageToModel(FileMessage message)
        {
            return new FileMessageModel(message.ID, UserToModel(message.FromUser), message.Date, FileInfoToModel(message.File));
        }

        private ImageMessageModel ImageMessageToModel(ImageMessage message)
        {
            return new ImageMessageModel(message.ID, UserToModel(message.FromUser), message.Date, FileInfoToModel(message.Image));
        }

        private UserModel UserToModel(User user)
        {
            return new UserModel(user.Name, user.IsOnline);
        }

        private FileInfoModel FileInfoToModel(FileInfo fileInfo)
        {
            return new FileInfoModel(fileInfo.Name, fileInfo.URL);
        }
    }
}
