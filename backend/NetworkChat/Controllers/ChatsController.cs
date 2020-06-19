using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Mime;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using NetworkChat.Infrastructure;
using NetworkChat.Models;
using NetworkChat.Services;
using NetworkChat.ViewModels;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace NetworkChat.Controllers
{
    [ApiController]
    [Authorize]
    [Produces(MediaTypeNames.Application.Json)]
    [Consumes(MediaTypeNames.Application.Json)]
    [Route(ApiConstant.Prefix + "[controller]")]
    public class ChatsController : Controller
    {
        private IChatService _chatService;
        private IUserService _userService;

        public ChatsController(IChatService chatService, IUserService userService)
        {
            _chatService = chatService;
            _userService = userService;
        }

        [Route("create")]
        [HttpPost]
        [ProducesResponseType(typeof(ChatModel), 200)]
        [ProducesResponseType(typeof(ApiError), 401)]
        public IActionResult Create([FromBody] GetChatModel model)
        {
            var user = _userService.FindUser(User.Identity.Name);
            var chat = _chatService.CreateChat(user, model.Title);
            return new JsonResult(chat);
        }

        [Route("my-chats")]
        [Authorize]
        [HttpPost]
        [ProducesResponseType(typeof(ChatModel[]), 200)]
        [ProducesResponseType(typeof(UnauthorizedResult), 401)]
        public IActionResult MyChats()
        {
            var chats = _chatService.GetUserChats(User.Identity.Name);
            return new JsonResult(chats);
        }

        [Route("{chatId}/delete")]
        [Authorize]
        [HttpPost]
        [ProducesResponseType(typeof(OkResult), 200)]
        [ProducesResponseType(typeof(UnauthorizedResult), 401)]
        [ProducesResponseType(typeof(ApiError), 401)]
        public IActionResult Delete(uint chatId)
        {
            _chatService.DeleteChat(User.Identity.Name, chatId);
            return new OkResult();
        }

        [Route("{chatId}/add-user")]
        [Authorize]
        [HttpPost]
        [ProducesResponseType(typeof(ChatMemberModel), 200)]
        [ProducesResponseType(typeof(UnauthorizedResult), 401)]
        [ProducesResponseType(typeof(ApiError), 401)]
        public IActionResult AddUser(uint chatId, [FromQuery] [BindRequired] string username)
        {
            var userToAdd = _userService.FindUser(username);
            var chatMember = _chatService.AddUserToChat(User.Identity.Name, chatId, userToAdd);
            return new JsonResult(chatMember);
        }

        [Route("{chatId}/remove-user")]
        [Authorize]
        [HttpPost]
        [ProducesResponseType(typeof(OkResult), 200)]
        [ProducesResponseType(typeof(UnauthorizedResult), 401)]
        [ProducesResponseType(typeof(ApiError), 401)]
        public IActionResult RemoveUser(uint chatId, [FromQuery] [BindRequired] string username)
        {
            _chatService.RemoveUserFromChat(User.Identity.Name, username, chatId);
            return new OkResult();
        }

        [Route("{chatId}/send-text-message")]
        [Authorize]
        [HttpPost]
        [ProducesResponseType(typeof(TextMessageModel), 200)]
        [ProducesResponseType(typeof(UnauthorizedResult), 401)]
        [ProducesResponseType(typeof(ApiError), 401)]
        public IActionResult SendTextMessage(uint chatId, [FromBody]SendMessageModel model)
        {
            var sender = _userService.FindUser(User.Identity.Name);
            var message = _chatService.SendTextMessage(sender, chatId, model.Text);
            return new JsonResult(message);
        }

        [Route("{chatId}/send-file-message")]
        [Authorize]
        [HttpPost]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(FileMessageModel), 200)]
        [ProducesResponseType(typeof(UnauthorizedResult), 401)]
        [ProducesResponseType(typeof(ApiError), 401)]
        public IActionResult SendFileMessage(uint chatId, [FromForm] [BindRequired] IFormFile file)
        {
            var sender = _userService.FindUser(User.Identity.Name);
            var message = _chatService.SendFileMessage(sender, chatId, file);
            return new JsonResult(message);
        }

        [Route("{chatId}/send-image-message")]
        [Authorize]
        [HttpPost]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(ImageMessageModel), 200)]
        [ProducesResponseType(typeof(UnauthorizedResult), 401)]
        [ProducesResponseType(typeof(ApiError), 401)]
        public IActionResult SendImageMessage(uint chatId, [FromForm] [BindRequired] IFormFile file)
        {
            var sender = _userService.FindUser(User.Identity.Name);
            var message = _chatService.SendImageMessage(sender, chatId, file);
            return new JsonResult(message);
        }
    }
}
