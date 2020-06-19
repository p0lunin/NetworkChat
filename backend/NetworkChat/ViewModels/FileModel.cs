using Microsoft.AspNetCore.Http;

namespace NetworkChat.ViewModels
{
    public class FileModel
    {
        public IFormFile File { get; }

        public FileModel(IFormFile file)
        {
            File = file;
        }
    }
}
