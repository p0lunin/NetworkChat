using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace NetworkChat.Services
{
    public interface IFileService
    {
        public Models.FileInfo AddFile(IFormFile file);
        public Models.FileInfo AddImage(IFormFile file);
    }
    public class FileService : IFileService
    {
        private IWebHostEnvironment _enviroment;
        public FileService(IWebHostEnvironment environment)
        {
            _enviroment = environment;
        }

        public Models.FileInfo AddFile(IFormFile file)
        {
            string path = "/Files/" + file.FileName;
            using (var fileStream = new FileStream(_enviroment.WebRootPath + path, FileMode.Create))
            {
                file.CopyTo(fileStream);
            }
            var fileInfo = new Models.FileInfo { Name = file.FileName, Path = path, URL = path };
            return fileInfo;
        }

        public Models.FileInfo AddImage(IFormFile file)
        {
            string path = "/Images/" + file.FileName;
            using (var fileStream = new FileStream(_enviroment.WebRootPath + path, FileMode.Create))
            {
                file.CopyTo(fileStream);
            }
            var fileInfo = new Models.FileInfo { Name = file.FileName, Path = path, URL = path };
            return fileInfo;
        }
    }
}
