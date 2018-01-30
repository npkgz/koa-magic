console.log("init module");
const net = require('net');

module.exports = {
    start: function(){
        const server = net.createServer((socket) => {
            // connections never end
          });
        
          server.listen(8000);
    }
}