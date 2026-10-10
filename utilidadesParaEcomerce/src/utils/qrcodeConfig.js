const qrcode = require('qrcode-terminal');

async function gerarQrCode(dado) {
    qrcode.generate(dado);
}
module.exports = {
    gerarQrCode
}