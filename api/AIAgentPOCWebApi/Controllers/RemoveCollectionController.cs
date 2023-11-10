using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel.Memory;

namespace AIAgentPOCWebApi.Controllers
{
    [Route("api/remove")]
    [ApiController]
    public class RemoveCollectionController : ControllerBase
    {
        private readonly IMemoryStore _sqliteMemory;

        public RemoveCollectionController(IMemoryStore memory)
        {
            _sqliteMemory = memory;
        }

        // DELETE api/<RemoveCollectionController>/Something
        [HttpDelete("{id}")]
        public async void Delete(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                this.BadRequest($"{id} does not exist");
            }

            if (await _sqliteMemory.DoesCollectionExistAsync(id))
            {
                await _sqliteMemory.DeleteCollectionAsync(id);
            }
        }
    }
}