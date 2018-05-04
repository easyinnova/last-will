function BackToLife(options){
    jQuery.extend(options,self.options);
    this.contract = web3.eth.contract(options.contract.abi).at(options.contract.address);
    this.hierarchyAbi = options.hierarchy.abi;
}

BackToLife.prototype.options={

};

BackToLife.prototype.getWills = function(){
    let self = this;
    let contract = this.contract;
    return new Promise(function(resolve, reject){
        contract.getMyContracts.call(async function(err, addressesStr){
            if (err) reject(err);
            if (addressesStr.slice(-1) === ";") addressesStr = addressesStr.substring(0, addressesStr.length -1);
            var adrList = addressesStr.split(";");

            // For each will contract
            let wills = [];
            for (let willAddress of adrList) {
                let info = await self.getHierarchyInfo(willAddress);
                wills.push({
                    address: willAddress,
                    owner: info.isOwner,
                    heirs: info.heirsList,
                });
            }
            resolve(wills);
        });
    });
};

BackToLife.prototype.getHierarchyInfo = function(willAddress){
    let contract = web3.eth.contract(this.hierarchyAbi).at(willAddress);
    return new Promise(function(resolve, reject){
        contract.isOwner.call(function(err, isOwner){
            if (err) reject(err);
            resolve({isOwner: isOwner, heirsList: ["0x1111", "0x2222"]});
        });
    });
};

/**
 * Hierarchy creations
 */
BackToLife.prototype.createVoteWill = function(addresses = null, percentages = null){
    // Validations
    if (addresses.length < 1 || addresses.length > 5) throw new Error("Invalid number of addresses");
    if (percentages && percentages.length !== addresses.length) throw new Error("Invalid number of percentages (must be the same as addresses");

    // Input params
    var addressesStr = addresses.join(";");
    var percentagesStr = "";
    if (percentages === null || percentages.length === 0) {
        switch (addresses.length) {
            case 1:
                percentagesStr = "100";
                break;
            case 2:
                percentagesStr = "50;50";
                break;
            case 3:
                percentagesStr = "33;33;34";
                break;
            case 4:
                percentagesStr = "25;25;25;25";
                break;
            case 5:
                percentagesStr = "20;20;20;20;20";
                break;
        }
    } else {
        percentagesStr = percentages.join(";");
    }

    // Do transaction
    let contract = this.contract;
    return new Promise(function(resolve, reject){
        console.log("Params:");
        console.log("  " + addressesStr);
        console.log("  " + percentagesStr);
        contract.createHierarchyContract.sendTransaction(addressesStr, percentagesStr, {gas: 1500000}, function(err, txHash){
            if (err) reject(err);
            resolve(txHash);
        });
    });
};

BackToLife.prototype.createNotaryWill= function(will){
    // TODO new contract type notary
};

BackToLife.prototype.createKeepAliveWill= function(){
    // TODO new contract type keep alive
};

/**
 * Get last created will
 */
BackToLife.prototype.getLastWillHash = function(){
    let contract = this.contract;
    return new Promise(function(resolve, reject){
        contract.getMyContracts.call(function(err, addressesStr){
            if (err) reject(err);
            if (addressesStr.slice(-1) === ";") addressesStr = addressesStr.substring(0, addressesStr.length -1);
            var adrList = addressesStr.split(";");
            resolve(adrList[adrList.length-1]);
        });
    });
};