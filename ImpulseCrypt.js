const crypto = require('crypto');
const password = 'impulsevmsbyteam3';
const sha256 = require('sha256');
/**
 *The Blockchain Implementation using sha256 Hashing for Impulse VMS
 * @class Block
 * @author JSGREWAL
 */
class Block {
/**
 *Creates an instance of Block 
 * @param {*} index
 * @param {*} data
 * @param {*} prevHash
 * @memberof Block
 */
constructor(index,data,prevHash) {
        this.index = index
        this.data = data
        this.prevHash = prevHash
        this.thisHash = sha256(
            this.index+this.data+this.prevHash
        )
    }

    /**
 *Sets-up next block using the last block
 * @param {*} lastBlock 
 * @param {*} data
 * @returns The Next Block
 */
 nextBlock(lastBlock,data){return  new Block(lastBlock.index+1,data,lastBlock.thisHash)}
 /**
  *CREATES BLOCK CHAIN
  * @param {*} num number of blocks
  * @param {*} firstBlock the First Block
  * @memberof Block
  */
 createBlockChain(firstBlock,num) {
    const blockchain = [firstBlock]
    let previousBlock = blockchain[0]
    for (let i = 1;i<num;i++) {
        var blockToAdd = nextBlock(previousBlock,`This is block #${i}`)
        blockchain.push(blockToAdd)
        previousBlock=blockToAdd
    }
    }    
}

module.exports = {
    /***
     * The Encryption Function AES 128
     * @author JSGREWAL
     */
    impulseEncrypt: function (data) {
        const cipher = crypto.createCipher('aes128', password);
        var encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    },
    /***
     * The Decryption Function AES 128
     * @author JSGREWAL
     */
    impulseDecrypt: function (data) {
        const decipher = crypto.createDecipher('aes128', password);
        var decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    },
    Block:Block
}

