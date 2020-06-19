using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;
using NetworkChat.Services;
using NetworkChat.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using NetworkChat.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace NetworkChat.Controllers
{
    [ApiController]
    [Produces(MediaTypeNames.Application.Json)]
    [Consumes(MediaTypeNames.Application.Json)]
    [Route(ApiConstant.Prefix + "[controller]")]
    public class UsersController : Controller
    {
        private readonly IUserService _userService;
        private readonly ISessionService _sessionService;
        private readonly IUpdatesService _updatesService;
        private readonly IOnlinesService _onlinesService;

        public UsersController(IUserService service, ISessionService sessionService, IUpdatesService updatesService, IOnlinesService onlinesService)
        {
            _userService = service;
            _sessionService = sessionService;
            _updatesService = updatesService;
            _onlinesService = onlinesService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(UserModel[]), 200)]
        public IActionResult Get()
        {
            return new JsonResult(_userService.GetAllUsers());
        }

        [Route("registration")]
        [HttpPost]
        [ProducesResponseType(typeof(UserModel), 200)]
        [ProducesResponseType(typeof(ApiError), 401)]
        public IActionResult Registration([FromBody] UserRegistrationModel model)
        {
            return new JsonResult(_userService.CreateUser(model.Name, model.Password));
        }

        [Route("authorization")]
        [HttpPost]
        [ProducesResponseType(typeof(AuthorizationResultModel), 200)]
        [ProducesResponseType(typeof(ApiError), 401)]
        public IActionResult Authorization([FromBody] UserRegistrationModel model)
        {
            var user = _userService.GetUser(model.Name, model.Password);

            var token = _sessionService.Authorize(user.Name);
            return new JsonResult(new AuthorizationResultModel(token, user));
        }

        [Authorize]
        [Route("hello")]
        [HttpPost]
        [ProducesResponseType(typeof(HelloModel), 200)]
        [ProducesResponseType(typeof(ApiError), 401)]
        public IActionResult Hello()
        {
            var username = User.Identity.Name;
            var user = _userService.FindUserModel(username);
            var lastUpdateId = _updatesService.GetLastUpdateId();
            return new JsonResult(new HelloModel { User = user, LastUpdateId = lastUpdateId });
        }

        [Authorize]
        [Route("get-updates")]
        [HttpPost]
        [ProducesResponseType(typeof(Update[]), 200)]
        [ProducesResponseType(typeof(ApiError), 401)]
        public IActionResult GetUpdates([FromQuery] [BindRequired] uint from)
        {
            var username = User.Identity.Name;
            _onlinesService.NotifyUserOnline(username);
            var updates = _updatesService.GetUserUpdates(username, from);
            return new JsonResult(updates);
        }
    }
}
